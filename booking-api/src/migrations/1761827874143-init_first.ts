import { MigrationInterface, QueryRunner } from "typeorm";

export class InitFirst1761827874143 implements MigrationInterface {
    name = 'InitFirst1761827874143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`role\` enum ('EMPLOYEE', 'ADMIN') NOT NULL DEFAULT 'EMPLOYEE', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`lastLoginAt\` datetime NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sessions\` (\`id\` varchar(255) NOT NULL, \`userId\` int NOT NULL, \`token\` varchar(255) NOT NULL, \`csrfToken\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`expiresAt\` datetime NOT NULL, \`ipHash\` varchar(255) NULL, \`userAgentHash\` varchar(255) NULL, INDEX \`IDX_13270b51f461a0ebfc0808ef62\` (\`expiresAt\`, \`userId\`), UNIQUE INDEX \`IDX_e9f62f5dcb8a54b84234c9e7a0\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`resources\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`type\` enum ('BOWLING_LANE', 'QUIZ_ROOM', 'KARAOKE_ROOM', 'BILLIARDS_TABLE') NOT NULL, \`pricePerHour\` decimal(10,2) NULL, \`priceFlat\` decimal(10,2) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_f276c867b5752b7cc2c6c797b2\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderId\` varchar(255) NOT NULL, \`resourceId\` int NOT NULL, \`quantity\` int NOT NULL DEFAULT '1', \`peopleCount\` int NULL, \`unitAmount\` int NOT NULL, \`totalAmount\` int NOT NULL, \`description\` varchar(255) NULL, \`pricingMode\` enum ('PER_RESOURCE_PER_HOUR', 'PER_PERSON_PER_HOUR', 'PER_PERSON_PER_SESSION') NOT NULL DEFAULT 'PER_RESOURCE_PER_HOUR', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` varchar(255) NOT NULL, \`status\` enum ('HOLD', 'PENDING_PAYMENT', 'PENDING_ONSITE', 'PAID', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'HOLD', \`paymentMethod\` enum ('ONLINE', 'ON_SITE_CASH', 'ON_SITE_CARD') NOT NULL DEFAULT 'ONLINE', \`totalAmount\` int NOT NULL, \`discountAmount\` int NOT NULL DEFAULT '0', \`appliedCouponCode\` varchar(255) NULL, \`currency\` varchar(255) NOT NULL DEFAULT 'PLN', \`customerName\` varchar(255) NOT NULL, \`customerEmail\` varchar(255) NOT NULL, \`customerPhone\` varchar(255) NULL, \`p24SessionId\` varchar(255) NULL, \`holdExpiresAt\` datetime NULL, \`paidAt\` datetime NULL, \`createdByUserId\` int NULL, \`updatedByUserId\` int NULL, \`cancelledAt\` datetime NULL, \`cancelledByUserId\` int NULL, \`deletedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_12b2eb710a09f0f604b1440672\` (\`customerEmail\`, \`status\`, \`createdAt\`), UNIQUE INDEX \`IDX_d2ef01278b6b31ccfedd90a583\` (\`p24SessionId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reserved_slots\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderId\` varchar(255) NOT NULL, \`resourceId\` int NOT NULL, \`startTime\` datetime NOT NULL, \`endTime\` datetime NOT NULL, \`status\` enum ('HOLD', 'BOOKED', 'RELEASED') NOT NULL DEFAULT 'HOLD', \`expiresAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_4bd1d57a8bbd1a9a31e7516fb5\` (\`status\`, \`expiresAt\`), INDEX \`IDX_2a72a4d142303352c1e366988c\` (\`expiresAt\`), INDEX \`IDX_95c3467b0b3b7623cf43ea2cfd\` (\`status\`), INDEX \`IDX_310119988a7fdbca0e690c35f3\` (\`resourceId\`, \`startTime\`, \`endTime\`), INDEX \`IDX_ec9486945cfc891b1a3dd0c24b\` (\`resourceId\`, \`status\`, \`startTime\`, \`endTime\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`coupon_allowed_resource_types\` (\`id\` int NOT NULL AUTO_INCREMENT, \`couponId\` int NOT NULL, \`resourceType\` enum ('BOWLING_LANE', 'QUIZ_ROOM', 'KARAOKE_ROOM', 'BILLIARDS_TABLE') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`coupon_email_assignments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`couponId\` int NOT NULL, \`email\` varchar(255) NOT NULL, \`usedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_cb99ea2bec16b98f6ee68a6ff1\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`coupon_redemptions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`couponId\` int NOT NULL, \`orderId\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`usedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX \`IDX_591791d4cdd7e815e1b91c44cd\` (\`email\`), INDEX \`IDX_26b8ad24ace2974b2b6c2047d3\` (\`couponId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`coupons\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL, \`type\` enum ('PERCENT', 'FIXED') NOT NULL, \`value\` int NOT NULL, \`validFrom\` datetime NULL, \`validTo\` datetime NULL, \`appliesToAll\` tinyint NOT NULL DEFAULT 1, \`isActive\` tinyint NOT NULL DEFAULT 1, \`minTotal\` int NULL, \`maxUsesTotal\` int NULL, \`usePerEmail\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_30b3e23f67075022bb11c8e5af\` (\`code\`, \`isActive\`, \`validFrom\`, \`validTo\`), UNIQUE INDEX \`IDX_e025109230e82925843f2a14c4\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cancellations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderId\` varchar(255) NOT NULL, \`reason\` varchar(255) NULL, \`actorUserId\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ca0257d26121053ac7ad51dcbc\` (\`orderId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`actorUserId\` int NULL, \`action\` enum ('CREATE', 'UPDATE', 'CANCEL', 'DELETE', 'LOGIN', 'LOGOUT') NOT NULL, \`entityType\` enum ('ORDER', 'ORDER_ITEM', 'RESERVED_SLOT') NOT NULL, \`entityId\` varchar(255) NOT NULL, \`before\` json NULL, \`after\` json NULL, \`reason\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_c69efb19bf127c97e6740ad530\` (\`createdAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`app_settings\` (\`id\` int NOT NULL DEFAULT '1', \`timezone\` varchar(255) NULL, \`openHour\` int NULL, \`closeHour\` int NULL, \`slotIntervalMinutes\` int NULL, \`holdDurationMinutes\` int NULL, \`priceBowlingPerHour\` int NULL, \`priceBilliardsPerHour\` int NULL, \`priceKaraokePerPersonPerHour\` int NULL, \`priceQuizPerPersonPerSession\` int NULL, \`billiardsTablesCount\` int NULL, \`bowlingMinDurationHours\` int NULL, \`bowlingMaxDurationHours\` int NULL, \`quizDurationHours\` int NULL, \`quizMaxPeople\` int NULL, \`karaokeMinDurationHours\` int NULL, \`karaokeMaxDurationHours\` int NULL, \`karaokeMaxPeople\` int NULL, \`p24MerchantId\` varchar(255) NULL, \`p24PosId\` varchar(255) NULL, \`p24Crc\` varchar(255) NULL, \`p24ApiKey\` varchar(255) NULL, \`p24Mode\` varchar(255) NULL, \`p24ReturnUrl\` varchar(255) NULL, \`p24StatusUrl\` varchar(255) NULL, \`demoMode\` tinyint NOT NULL DEFAULT 1, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_57de40bc620f456c7311aa3a1e6\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_cb79e43c9c326b20826b36f5237\` FOREIGN KEY (\`resourceId\`) REFERENCES \`resources\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_1966cb7dd250abd223a27b62030\` FOREIGN KEY (\`createdByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_960a50108735c365006b7fbd606\` FOREIGN KEY (\`updatedByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_8223b79f32eafbace538d5ec951\` FOREIGN KEY (\`cancelledByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reserved_slots\` ADD CONSTRAINT \`FK_f3fb3c1a414faf8fa581b9926f0\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reserved_slots\` ADD CONSTRAINT \`FK_99b08bf4d353497ed71de78aeaa\` FOREIGN KEY (\`resourceId\`) REFERENCES \`resources\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`coupon_allowed_resource_types\` ADD CONSTRAINT \`FK_a42dbec4d3b2b2c9be61616099d\` FOREIGN KEY (\`couponId\`) REFERENCES \`coupons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`coupon_email_assignments\` ADD CONSTRAINT \`FK_fac6b0014a0ac33d22ab8fe100c\` FOREIGN KEY (\`couponId\`) REFERENCES \`coupons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`coupon_redemptions\` ADD CONSTRAINT \`FK_26b8ad24ace2974b2b6c2047d3a\` FOREIGN KEY (\`couponId\`) REFERENCES \`coupons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cancellations\` ADD CONSTRAINT \`FK_ca0257d26121053ac7ad51dcbc0\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cancellations\` ADD CONSTRAINT \`FK_20034569332aaebd527656a3f66\` FOREIGN KEY (\`actorUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_e36d23e1e7cf81ea77758bef795\` FOREIGN KEY (\`actorUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_e36d23e1e7cf81ea77758bef795\``);
        await queryRunner.query(`ALTER TABLE \`cancellations\` DROP FOREIGN KEY \`FK_20034569332aaebd527656a3f66\``);
        await queryRunner.query(`ALTER TABLE \`cancellations\` DROP FOREIGN KEY \`FK_ca0257d26121053ac7ad51dcbc0\``);
        await queryRunner.query(`ALTER TABLE \`coupon_redemptions\` DROP FOREIGN KEY \`FK_26b8ad24ace2974b2b6c2047d3a\``);
        await queryRunner.query(`ALTER TABLE \`coupon_email_assignments\` DROP FOREIGN KEY \`FK_fac6b0014a0ac33d22ab8fe100c\``);
        await queryRunner.query(`ALTER TABLE \`coupon_allowed_resource_types\` DROP FOREIGN KEY \`FK_a42dbec4d3b2b2c9be61616099d\``);
        await queryRunner.query(`ALTER TABLE \`reserved_slots\` DROP FOREIGN KEY \`FK_99b08bf4d353497ed71de78aeaa\``);
        await queryRunner.query(`ALTER TABLE \`reserved_slots\` DROP FOREIGN KEY \`FK_f3fb3c1a414faf8fa581b9926f0\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_8223b79f32eafbace538d5ec951\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_960a50108735c365006b7fbd606\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_1966cb7dd250abd223a27b62030\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_cb79e43c9c326b20826b36f5237\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_57de40bc620f456c7311aa3a1e6\``);
        await queryRunner.query(`DROP TABLE \`app_settings\``);
        await queryRunner.query(`DROP INDEX \`IDX_c69efb19bf127c97e6740ad530\` ON \`audit_logs\``);
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_ca0257d26121053ac7ad51dcbc\` ON \`cancellations\``);
        await queryRunner.query(`DROP TABLE \`cancellations\``);
        await queryRunner.query(`DROP INDEX \`IDX_e025109230e82925843f2a14c4\` ON \`coupons\``);
        await queryRunner.query(`DROP INDEX \`IDX_30b3e23f67075022bb11c8e5af\` ON \`coupons\``);
        await queryRunner.query(`DROP TABLE \`coupons\``);
        await queryRunner.query(`DROP INDEX \`IDX_26b8ad24ace2974b2b6c2047d3\` ON \`coupon_redemptions\``);
        await queryRunner.query(`DROP INDEX \`IDX_591791d4cdd7e815e1b91c44cd\` ON \`coupon_redemptions\``);
        await queryRunner.query(`DROP TABLE \`coupon_redemptions\``);
        await queryRunner.query(`DROP INDEX \`IDX_cb99ea2bec16b98f6ee68a6ff1\` ON \`coupon_email_assignments\``);
        await queryRunner.query(`DROP TABLE \`coupon_email_assignments\``);
        await queryRunner.query(`DROP TABLE \`coupon_allowed_resource_types\``);
        await queryRunner.query(`DROP INDEX \`IDX_ec9486945cfc891b1a3dd0c24b\` ON \`reserved_slots\``);
        await queryRunner.query(`DROP INDEX \`IDX_310119988a7fdbca0e690c35f3\` ON \`reserved_slots\``);
        await queryRunner.query(`DROP INDEX \`IDX_95c3467b0b3b7623cf43ea2cfd\` ON \`reserved_slots\``);
        await queryRunner.query(`DROP INDEX \`IDX_2a72a4d142303352c1e366988c\` ON \`reserved_slots\``);
        await queryRunner.query(`DROP INDEX \`IDX_4bd1d57a8bbd1a9a31e7516fb5\` ON \`reserved_slots\``);
        await queryRunner.query(`DROP TABLE \`reserved_slots\``);
        await queryRunner.query(`DROP INDEX \`IDX_d2ef01278b6b31ccfedd90a583\` ON \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_12b2eb710a09f0f604b1440672\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`order_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_f276c867b5752b7cc2c6c797b2\` ON \`resources\``);
        await queryRunner.query(`DROP TABLE \`resources\``);
        await queryRunner.query(`DROP INDEX \`IDX_e9f62f5dcb8a54b84234c9e7a0\` ON \`sessions\``);
        await queryRunner.query(`DROP INDEX \`IDX_13270b51f461a0ebfc0808ef62\` ON \`sessions\``);
        await queryRunner.query(`DROP TABLE \`sessions\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
