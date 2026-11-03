import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AppRoutes } from "./routes/AppRouter"

const router = createBrowserRouter([
  {
    path: "*",
    element: <AppRoutes />
  }
])


export default function App() {

  return <RouterProvider router={router} />
}