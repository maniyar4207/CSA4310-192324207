import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class LifeCycleServlet extends HttpServlet {

     
    public void init() throws ServletException {
        System.out.println("Servlet Initialized");
    }

    
    public void service(HttpServletRequest req,
                        HttpServletResponse res)
                        throws IOException {

        res.setContentType("text/html");
        PrintWriter out = res.getWriter();

        out.println("<h1>Welcome to Servlet</h1>");
        out.println("<h2>Service Method Executed</h2>");
    }

     
    public void destroy() {
        System.out.println("Servlet Destroyed");
    }
}