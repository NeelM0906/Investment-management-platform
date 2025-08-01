const fs = require('fs').promises;
const path = require('path');

async function migrateProjectData() {
  const dataDir = path.join(process.cwd(), 'data');
  const projectsFile = path.join(dataDir, 'projects.json');
  const backupFile = path.join(dataDir, `projects-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

  try {
    // Read existing projects
    const existingData = await fs.readFile(projectsFile, 'utf-8');
    const projects = JSON.parse(existingData);

    // Create backup
    await fs.writeFile(backupFile, existingData);
    console.log(`Backup created: ${backupFile}`);

    // Check if projects already have commitment/reservation fields
    const needsMigration = projects.some(project => 
      !project.commitments || !project.reservations
    );

    if (!needsMigration) {
      console.log('Projects already have commitment and reservation fields. No migration needed.');
      return;
    }

    // Add commitment and reservation fields to existing projects
    const migratedProjects = projects.map(project => {
      if (!project.commitments || !project.reservations) {
        return {
          ...project,
          commitments: {
            totalAmount: 0,
            investorCount: 0
          },
          reservations: {
            totalAmount: 0,
            investorCount: 0
          },
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });

    // Write migrated data
    await fs.writeFile(projectsFile, JSON.stringify(migratedProjects, null, 2));
    console.log(`Successfully migrated ${migratedProjects.length} projects with commitment and reservation fields.`);

    // Show sample of migrated data
    console.log('\nSample migrated project:');
    console.log(JSON.stringify(migratedProjects[0], null, 2));

  } catch (error) {
    console.error('Error migrating project data:', error);
    process.exit(1);
  }
}

// Run the migration
migrateProjectData().catch(console.error);