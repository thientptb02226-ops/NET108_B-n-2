using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Net108Khai.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AccountSecurity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExternalLoginTickets",
                schema: "commerce",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodeHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    RedeemedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalLoginTickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExternalLoginTickets_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "commerce",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExternalLoginTickets_CodeHash",
                schema: "commerce",
                table: "ExternalLoginTickets",
                column: "CodeHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalLoginTickets_ExpiresAt",
                schema: "commerce",
                table: "ExternalLoginTickets",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalLoginTickets_UserId",
                schema: "commerce",
                table: "ExternalLoginTickets",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExternalLoginTickets",
                schema: "commerce");
        }
    }
}
