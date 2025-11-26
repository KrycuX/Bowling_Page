import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentTransactions1762240745991 implements MigrationInterface {
    name = 'AddPaymentTransactions1762240745991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`payment_transactions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`orderId\` varchar(255) NOT NULL,
                \`p24OrderId\` int NULL,
                \`sessionId\` varchar(255) NOT NULL,
                \`amount\` int NOT NULL,
                \`currency\` varchar(255) NOT NULL DEFAULT 'PLN',
                \`method\` varchar(255) NULL,
                \`status\` enum('PENDING', 'SUCCESS', 'FAILED', 'ABANDONED', 'TIMED_OUT', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
                \`statusHistory\` json NULL,
                \`webhookSignature\` varchar(255) NULL,
                \`verifyResponse\` json NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_payment_transactions_orderId\` (\`orderId\`),
                INDEX \`IDX_payment_transactions_sessionId\` (\`sessionId\`),
                INDEX \`IDX_payment_transactions_status\` (\`status\`),
                INDEX \`IDX_payment_transactions_orderId_status\` (\`orderId\`, \`status\`),
                CONSTRAINT \`FK_payment_transactions_orderId\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`payment_transactions\``);
    }

}
