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
    const exportStatus = `${url}/api/document/trigger`;

    // rutas de usuarios
    const userList = `${url}/api/user/list`;
    const userProfile = `${url}/api/user/profile`;

    //rutas de administrador
    const approveUser = `${url}/api/admin/approve-user`;

    //rutas api whatsapp

    const getQr = `${url}/api/whatsapp/get-qr`;
    const logoutWhatsapp = `${url}/api/whatsapp/logout`;
    const statusLog = `${url}/api/whatsapp/log-status`;
    const profileInfo = `${url}/api/whatsapp/profile`;

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
      exportStatus,
      approveUser,
      userProfile,
      getQr,
      logoutWhatsapp,
      statusLog,
      profileInfo
    };
  };
  