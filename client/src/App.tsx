import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Main from './components/Main';
import Approved from './components/Approved';
import Denied from './components/Denied';
import Select from './components/Select';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Main/>
  },
  {
    path: '/aprovado',
    element: <Approved/>
  },
  {
    path: '/negado',
    element: <Denied/>
  },
  {
    path:'/selecionar/:cpf',
    element: <Select/>
  }
])

export default function App() {
  return (
    <RouterProvider router={router}/>
  )
}