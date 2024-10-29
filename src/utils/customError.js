const err = {
    errorLogin: {
      message: "An error occurred during login",
      statusCode: 400,  
    },
    errorCreate:{
      message: "An error occurred while adding data",
      statusCode: 400, 
    },
    errorUpdate:{
      message: "An error occurred while changing data",
      statusCode: 400, 
    },
    errorDelete:{
      message: "An error occurred while deleting data",
      statusCode: 400, 
    },
    errorSelect:{
      message: "An error occurred while displaying data",
      statusCode: 400, 
    },
    errorChangePassword:{
      message: "An error occurred while changing the password",
      statusCode: 400, 
    },
    errorChangeRole:{
      message: "An error occurred while changing the user role",
      statusCode: 400, 
    },
    errorLogout:{
      message: "An error occurred while logging out",
      statusCode: 400, 
    },
    errorRequest:{
      message: "An error occurred while processing your request.",
      statusCode: 500, 
    },
    errorReset:{
      message: "An error occurred while resetting your request.",
      statusCode: 500, 
    },
  };
  
  module.exports = {
    err,
  };