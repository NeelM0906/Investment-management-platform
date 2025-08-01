"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const ProjectService_1 = require("../services/ProjectService");
const DebtEquityClassService_1 = require("../services/DebtEquityClassService");
const CustomUnitClassService_1 = require("../services/CustomUnitClassService");
const projectsRouter = require('../../server/routes/projects');
const debtEquityClassesRouter = require('../../server/routes/debt-equity-classes');
const customUnitClassesRouter = require('../../server/routes/custom-unit-classes');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/projects', projectsRouter);
app.use('/api/debt-equity-classes', debtEquityClassesRouter);
app.use('/api/custom-unit-classes', customUnitClassesRouter);
describe('Debt & Equity Classes API Integration Tests', () => {
    let projectService;
    let debtEquityClassService;
    let customUnitClassService;
    let testProjectId;
    beforeAll(async () => {
        projectService = new ProjectService_1.ProjectService();
        debtEquityClassService = new DebtEquityClassService_1.DebtEquityClassService();
        customUnitClassService = new CustomUnitClassService_1.CustomUnitClassService();
        const testProject = await projectService.createProject({
            projectName: 'Test Project for API',
            legalProjectName: 'Test Legal Project for API',
            unitCalculationPrecision: 2,
            targetAmount: 1000000,
            currency: 'USD',
            startDate: '2025-01-01',
            endDate: '2025-12-31'
        });
        testProjectId = testProject.id;
    });
    afterAll(async () => {
        try {
            await projectService.deleteProject(testProjectId);
        }
        catch (error) {
        }
    });
    describe('GET /api/projects/:id/debt-equity-classes', () => {
        it('should return debt equity classes for a valid project', async () => {
            const response = await (0, supertest_1.default)(app)
                .get(`/api/projects/${testProjectId}/debt-equity-classes`)
                .expect(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
        it('should return 404 when project does not exist', async () => {
            const nonExistentProjectId = 'non-existent-project-id';
            const response = await (0, supertest_1.default)(app)
                .get(`/api/projects/${nonExistentProjectId}/debt-equity-classes`)
                .expect(404);
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Project not found'
                }
            });
        });
    });
    describe('POST /api/projects/:id/debt-equity-classes', () => {
        const validClassData = {
            unitClass: 'Class A',
            unitPrice: 100,
            isOpenToInvestments: true,
            investmentIncrementAmount: 1000,
            minInvestmentAmount: 5000,
            maxInvestmentAmount: 100000
        };
        it('should create a new debt equity class successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/debt-equity-classes`)
                .send(validClassData)
                .expect(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message', 'Debt equity class created successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('projectId', testProjectId);
            expect(response.body.data).toHaveProperty('unitClass', 'Class A');
            expect(response.body.data).toHaveProperty('unitPrice', 100);
        });
        it('should return 400 for missing required fields', async () => {
            const incompleteData = {
                unitClass: 'Class A',
                unitPrice: 100
            };
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/debt-equity-classes`)
                .send(incompleteData)
                .expect(400);
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Missing required fields',
                    details: 'Missing fields: investmentIncrementAmount, minInvestmentAmount, maxInvestmentAmount'
                }
            });
        });
        it('should return 404 when project does not exist', async () => {
            const nonExistentProjectId = 'non-existent-project-id';
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${nonExistentProjectId}/debt-equity-classes`)
                .send(validClassData)
                .expect(404);
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Project not found'
                }
            });
        });
        it('should return 400 for validation errors', async () => {
            const invalidClassData = {
                unitClass: 'Class A',
                unitPrice: -100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 1000,
                minInvestmentAmount: 5000,
                maxInvestmentAmount: 100000
            };
            const response = await (0, supertest_1.default)(app)
                .post(`/api/projects/${testProjectId}/debt-equity-classes`)
                .send(invalidClassData)
                .expect(400);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        });
    });
    describe('PUT /api/debt-equity-classes/:classId', () => {
        let createdClassId;
        beforeAll(async () => {
            const classData = {
                unitClass: 'Class B',
                unitPrice: 100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 1000,
                minInvestmentAmount: 5000,
                maxInvestmentAmount: 100000
            };
            const createdClass = await debtEquityClassService.createClass(testProjectId, classData);
            createdClassId = createdClass.id;
        });
        const updateData = {
            unitPrice: 150,
            isOpenToInvestments: false
        };
        it('should update a debt equity class successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .put(`/api/debt-equity-classes/${createdClassId}`)
                .send(updateData)
                .expect(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message', 'Debt equity class updated successfully');
            expect(response.body.data).toHaveProperty('id', createdClassId);
            expect(response.body.data).toHaveProperty('unitPrice', 150);
            expect(response.body.data).toHaveProperty('isOpenToInvestments', false);
        });
        it('should return 404 when class does not exist', async () => {
            const nonExistentClassId = 'non-existent-class-id';
            const response = await (0, supertest_1.default)(app)
                .put(`/api/debt-equity-classes/${nonExistentClassId}`)
                .send(updateData)
                .expect(404);
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Debt equity class not found'
                }
            });
        });
        it('should return 400 for validation errors', async () => {
            const invalidUpdateData = {
                unitPrice: -150,
                isOpenToInvestments: false
            };
            const response = await (0, supertest_1.default)(app)
                .put(`/api/debt-equity-classes/${createdClassId}`)
                .send(invalidUpdateData)
                .expect(400);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        });
    });
    describe('DELETE /api/debt-equity-classes/:classId', () => {
        let classToDeleteId;
        beforeAll(async () => {
            const classData = {
                unitClass: 'Class C',
                unitPrice: 100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 1000,
                minInvestmentAmount: 5000,
                maxInvestmentAmount: 100000
            };
            const createdClass = await debtEquityClassService.createClass(testProjectId, classData);
            classToDeleteId = createdClass.id;
        });
        it('should delete a debt equity class successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .delete(`/api/debt-equity-classes/${classToDeleteId}`)
                .expect(200);
            expect(response.body).toEqual({
                success: true,
                message: 'Debt equity class deleted successfully'
            });
        });
        it('should return 404 when class does not exist', async () => {
            const nonExistentClassId = 'non-existent-class-id';
            const response = await (0, supertest_1.default)(app)
                .delete(`/api/debt-equity-classes/${nonExistentClassId}`)
                .expect(404);
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Debt equity class not found'
                }
            });
        });
    });
    describe('GET /api/custom-unit-classes', () => {
        it('should return all custom unit classes', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/custom-unit-classes')
                .expect(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
    describe('POST /api/custom-unit-classes', () => {
        const validCustomClassData = {
            name: `Test Class ${Date.now()}`
        };
        it('should create a new custom unit class successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/custom-unit-classes')
                .send(validCustomClassData)
                .expect(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('message', 'Custom unit class created successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name', validCustomClassData.name);
            expect(response.body.data).toHaveProperty('createdAt');
        });
        it('should return 400 for missing name', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/custom-unit-classes')
                .send({})
                .expect(400);
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Custom class name is required and must be a non-empty string'
                }
            });
        });
        it('should return 400 for empty name', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/custom-unit-classes')
                .send({ name: '   ' })
                .expect(400);
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Custom class name is required and must be a non-empty string'
                }
            });
        });
        it('should return 400 for duplicate name', async () => {
            const duplicateClassName = `Duplicate Class ${Date.now()}`;
            await (0, supertest_1.default)(app)
                .post('/api/custom-unit-classes')
                .send({ name: duplicateClassName })
                .expect(201);
            const response = await (0, supertest_1.default)(app)
                .post('/api/custom-unit-classes')
                .send({ name: duplicateClassName })
                .expect(400);
            expect(response.body).toEqual({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Custom class name already exists'
                }
            });
        });
        it('should trim whitespace from name', async () => {
            const trimmedName = `Trimmed Class ${Date.now()}`;
            const response = await (0, supertest_1.default)(app)
                .post('/api/custom-unit-classes')
                .send({ name: `  ${trimmedName}  ` })
                .expect(201);
            expect(response.body.data).toHaveProperty('name', trimmedName);
        });
    });
});
//# sourceMappingURL=debtEquityClasses.integration.test.js.map