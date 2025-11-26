import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendAppSettingsTtl1762240733362 implements MigrationInterface {
    name = 'ExtendAppSettingsTtl1762240733362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`holdTtlOnlineMinutes\` int NULL DEFAULT 15`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`holdTtlLastMinuteMinutes\` int NULL DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`holdTtlPeakHoursMinutes\` int NULL DEFAULT 10`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`holdTtlOnsiteBeforeStartMinutes\` int NULL DEFAULT 45`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`holdTtlOnsiteGraceAfterStartMinutes\` int NULL DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`peakHoursStart\` int NULL DEFAULT 17`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`peakHoursEnd\` int NULL DEFAULT 22`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`lastMinuteThresholdMinutes\` int NULL DEFAULT 60`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`lastMinuteThresholdMinutes\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`peakHoursEnd\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`peakHoursStart\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`holdTtlOnsiteGraceAfterStartMinutes\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`holdTtlOnsiteBeforeStartMinutes\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`holdTtlPeakHoursMinutes\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`holdTtlLastMinuteMinutes\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`holdTtlOnlineMinutes\``);
    }

}
