import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeeklyHours1763400000000 implements MigrationInterface {
    name = 'AddWeeklyHours1763400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`weeklyHours\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`weeklyHours\``);
    }
}
