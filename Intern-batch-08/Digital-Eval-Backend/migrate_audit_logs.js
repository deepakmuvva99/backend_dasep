const db = require('./config/database');

async function migrate() {
    try {
        console.log('Starting migration for audit_logs table...');
        
        // 1. Add ip_address
        await db.execute(`
            ALTER TABLE audit_logs 
            ADD COLUMN ip_address VARCHAR(45) NULL AFTER new_value,
            ADD COLUMN user_agent TEXT NULL AFTER ip_address,
            ADD COLUMN user_role VARCHAR(50) NULL AFTER user_agent;
        `);
        
        console.log('Successfully added ip_address, user_agent, and user_role columns.');
        
        // 2. Add index for performance
        await db.execute(`
            CREATE INDEX idx_user_role ON audit_logs(user_role);
        `);
        
        console.log('Successfully added index on user_role.');
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
