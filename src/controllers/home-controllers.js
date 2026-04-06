

const homeController = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the Home Page!",
    });
}


const userProfileController = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to your Profile!",
        user: req.user, // Assuming you have user information in the request object
    });
}

const adminDashboardController = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the Admin Dashboard!",
        user: req.user, // Assuming you have user information in the request object
    });
}


export { homeController, userProfileController, adminDashboardController };