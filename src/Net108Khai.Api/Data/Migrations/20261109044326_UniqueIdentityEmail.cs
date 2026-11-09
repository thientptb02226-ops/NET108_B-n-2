using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Net108Khai.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class UniqueIdentityEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "EmailIndex",
                schema: "commerce",
                table: "AspNetUsers");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                schema: "commerce",
                table: "AspNetUsers",
                column: "NormalizedEmail",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "EmailIndex",
                schema: "commerce",
                table: "AspNetUsers");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                schema: "commerce",
                table: "AspNetUsers",
                column: "NormalizedEmail");
        }
    }
}
