"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
async function clearMigrations() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Connected to database');
        await data_source_1.AppDataSource.query('DELETE FROM migrations');
        console.log('✅ Migrations table cleared');
        await data_source_1.AppDataSource.destroy();
        console.log('Connection closed');
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
clearMigrations();
//# sourceMappingURL=clear-migrations.js.map