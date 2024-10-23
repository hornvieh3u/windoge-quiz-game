import { RouterProvider } from "react-router-dom";
import router from "./router";

function App() {
  return (
    <div className="md:container md:mx-auto text-stone-700 text-[20px]">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;