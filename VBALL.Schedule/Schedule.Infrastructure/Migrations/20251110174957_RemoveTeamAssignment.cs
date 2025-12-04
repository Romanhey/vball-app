using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Schedule.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTeamAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeamAssigments");

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "Participation",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TeamId",
                table: "Participation",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Participation_TeamId",
                table: "Participation",
                column: "TeamId");

            migrationBuilder.AddForeignKey(
                name: "FK_Participation_Teams_TeamId",
                table: "Participation",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "TeamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Participation_Teams_TeamId",
                table: "Participation");

            migrationBuilder.DropIndex(
                name: "IX_Participation_TeamId",
                table: "Participation");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "Participation");

            migrationBuilder.DropColumn(
                name: "TeamId",
                table: "Participation");

            migrationBuilder.CreateTable(
                name: "TeamAssigments",
                columns: table => new
                {
                    TeamAssignmentId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ParticipationId = table.Column<int>(type: "integer", nullable: false),
                    TeamId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamAssignments", x => x.TeamAssignmentId);
                });
        }
    }
}
