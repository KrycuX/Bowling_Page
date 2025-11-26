import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDayOffs1763500000000 implements MigrationInterface {
    name = 'AddDayOffs1763500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`day_offs\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`date\` date NOT NULL,
                \`reason\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_d241146bb5622a1da5efd2d609\` (\`date\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_d241146bb5622a1da5efd2d609\` ON \`day_offs\``);
        await queryRunner.query(`DROP TABLE \`day_offs\``);
    }
}

