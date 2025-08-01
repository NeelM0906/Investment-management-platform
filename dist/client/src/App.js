"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
require("./App.css");
const Layout_1 = __importDefault(require("./components/Layout"));
const Dashboard_1 = __importDefault(require("./pages/Dashboard"));
const ProjectsPage_1 = __importDefault(require("./pages/ProjectsPage"));
const CreateProjectPage_1 = __importDefault(require("./pages/CreateProjectPage"));
const ProjectDetailsPage_1 = __importDefault(require("./pages/ProjectDetailsPage"));
function App() {
    return (<react_router_dom_1.BrowserRouter>
      <div className="App">
        <Layout_1.default>
          <react_router_dom_1.Routes>
            <react_router_dom_1.Route path="/" element={<Dashboard_1.default />}/>
            <react_router_dom_1.Route path="/projects" element={<ProjectsPage_1.default />}/>
            <react_router_dom_1.Route path="/projects/new" element={<CreateProjectPage_1.default />}/>
            <react_router_dom_1.Route path="/projects/:id" element={<ProjectDetailsPage_1.default />}/>
          </react_router_dom_1.Routes>
        </Layout_1.default>
      </div>
    </react_router_dom_1.BrowserRouter>);
}
exports.default = App;
//# sourceMappingURL=App.js.map