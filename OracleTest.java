import java.sql.*;

public class OracleTest {
    public static void main(String[] args) {
        try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
            Connection con = DriverManager.getConnection(
                "jdbc:oracle:thin:@localhost:1521:XE", "schema.sql", "N@veen_rwt007");

            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM employees");

            while (rs.next()) {
                System.out.println(rs.getString(1));
            }

            con.close();
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
