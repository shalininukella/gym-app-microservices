import app from './app';
import dotenv from "dotenv";
// Define port
dotenv.config();
const PORT = process.env.PORT || 5000;
 

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
