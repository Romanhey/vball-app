using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Schedule.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchemaName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Participations",
                table: "Participations");

            migrationBuilder.RenameTable(
                name: "Participations",
                newName: "Participation");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Participation",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Participation",
                table: "Participation",
                column: "ParticipationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Participation",
                table: "Participation");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Participation");

            migrationBuilder.RenameTable(
                name: "Participation",
                newName: "Participations");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Participations",
                table: "Participations",
                column: "ParticipationId");
        }
    }
}
