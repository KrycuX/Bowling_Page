import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGalleryImages1763300000000 implements MigrationInterface {
    name = 'AddGalleryImages1763300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`gallery_images\` (\`id\` int NOT NULL AUTO_INCREMENT, \`filename\` varchar(256) NOT NULL, \`originalFilename\` varchar(256) NOT NULL, \`path\` varchar(512) NOT NULL, \`url\` varchar(512) NOT NULL, \`section\` varchar(64) NULL, \`order\` int NOT NULL DEFAULT 0, \`caption\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_gallery_images_section_order\` (\`section\`, \`order\`), INDEX \`IDX_gallery_images_createdAt\` (\`createdAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_gallery_images_createdAt\` ON \`gallery_images\``);
        await queryRunner.query(`DROP INDEX \`IDX_gallery_images_section_order\` ON \`gallery_images\``);
        await queryRunner.query(`DROP TABLE \`gallery_images\``);
    }

}

