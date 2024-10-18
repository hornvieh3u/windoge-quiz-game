import { createBrowserRouter } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Content from "./pages/Content";

export default createBrowserRouter([
    {
        path: "/",
        element: <Login />,
        errorElement: <div>Error!</div>,
        children: [
            {
                path: "login",
                element: <Login />
            },
        ]
    },
    {
        path: "/register",
        element: <Register />,
        errorElement: <div>Error!</div>
    },
    {
        path: "/content",
        element: <Content />,
        errorElement: <div>Error!</div>
    },
]);