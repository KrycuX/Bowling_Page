import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderNumber1763600000000 implements MigrationInterface {
    name = 'AddOrderNumber1763600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`orders\` 
            ADD COLUMN \`orderNumber\` varchar(255) NULL
        `);
        
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_order_number\` ON \`orders\` (\`orderNumber\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_order_number\` ON \`orders\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`orderNumber\``);
    }
}

