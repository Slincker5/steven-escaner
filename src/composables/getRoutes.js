export const useGetRoutes = () => {
    // Ruta global
    const url = `https://steven.multimarcas.app`;
    //const url = `http://localhost`;
    const userNoPhoto = "https://cintillos-plazamundo.netlify.app/usuario.png";

  
    // Rutas de autenticacion
    const authLogin = `${url}/api/auth/login`;
    const authRegister = `${url}/api/auth/register`;
  
    // Rutas subir archivo
    const uploadFile = `${url}/api/document/upload`;

    // rutas listar productos
    const listProducts = `${url}/api/document/list`;
    const remainingProducts = `${url}/api/document/productos-restantes`;
    const scanner = `${url}/api/document/escanear`;

    // rutas de usuarios
    const userList = `${url}/api/user/list`;

    //rutas de administrador
    const approveUser = `${url}/api/admin/approve-user`;

    return {
      url,
      userNoPhoto,
      authLogin,
      authRegister,
      uploadFile,
      listProducts,
      remainingProducts,
      scanner,
      userList,
      approveUser
    };
  };
  