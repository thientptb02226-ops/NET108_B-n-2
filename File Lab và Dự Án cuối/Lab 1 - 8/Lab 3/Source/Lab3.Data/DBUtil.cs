using System.Data;
using Microsoft.Data.SqlClient;

namespace Lab3.Data;

public sealed class DBUtil(string connectionString)
{
    private readonly string _connectionString = !string.IsNullOrWhiteSpace(connectionString)
        ? connectionString : throw new ArgumentException("Connection string is required.", nameof(connectionString));

    public DataTable QueryDataTable(string sql, List<object?> parameters)
    {
        using var connection = new SqlConnection(_connectionString);
        using var command = CreateCommand(connection, sql, parameters);
        using var adapter = new SqlDataAdapter(command);
        var table = new DataTable();
        adapter.Fill(table);
        return table;
    }

    public object? ExecuteScalar(string sql, List<object?> parameters)
    {
        using var connection = new SqlConnection(_connectionString);
        using var command = CreateCommand(connection, sql, parameters);
        connection.Open();
        return command.ExecuteScalar();
    }

    public int ExecuteNonQuery(string sql, List<object?> parameters)
    {
        using var connection = new SqlConnection(_connectionString);
        using var command = CreateCommand(connection, sql, parameters);
        connection.Open();
        return command.ExecuteNonQuery();
    }

    private static SqlCommand CreateCommand(SqlConnection connection, string sql, List<object?> parameters)
    {
        var command = new SqlCommand(sql, connection);
        for (var index = 0; index < parameters.Count; index++)
        {
            var value = parameters[index] ?? DBNull.Value;
            var parameter = value is string
                ? new SqlParameter($"@{index + 1}", SqlDbType.NVarChar) { Value = value }
                : new SqlParameter($"@{index + 1}", value);
            command.Parameters.Add(parameter);
        }
        return command;
    }
}
