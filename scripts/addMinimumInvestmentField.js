const fs = require('fs').promises;
const path = require('path');

async function addMinimumInvestmentField() {
  const dataDir = path.join(process.cwd(), 'data');
  const projectsFile = path.join(dataDir, 'projects.json');
  const backupFile = path.join(dataDir, `projects-backup-minimum-investment-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

  try {
    // Read existing projects
    const existingData = await fs.readFile(projectsFile, 'utf-8');
    const projects = JSON.parse(existingData);

    // Create backup
    await fs.writeFile(backupFile, existingData);
    console.log(`Backup created: ${backupFile}`);

    // Check if projects already have minimumInvestment field
    const needsMigration = projects.some(project => 
      project.minimumInvestment === undefined
    );

    if (!needsMigration) {
      console.log('Projects already have minimumInvestment field. No migration needed.');
      return;
    }

    // Add minimumInvestment field to existing projects
    const migratedProjects = projects.map(project => {
      if (project.minimumInvestment === undefined) {
        return {
          ...project,
          minimumInvestment: null, // Set to null for existing projects (optional field)
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });

    // Write migrated data
    await fs.writeFile(projectsFile, JSON.stringify(migratedProjects, null, 2));
    console.log(`Successfully migrated ${migratedProjects.length} projects with minimumInvestment field.`);

    // Show sample of migrated data
    console.log('\nSample migrated project:');
    console.log(JSON.stringify(migratedProjects[0], null, 2));

  } catch (error) {
    console.error('Error migrating project data:', error);
    process.exit(1);
  }
}

// Run the migration
addMinimumInvestmentField().catch(console.error);