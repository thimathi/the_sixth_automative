import User from '../models/User.js';
import { generateUUID } from '../utils/helpers.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user data without password
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department, password } = req.body;
    console.log(firstName);

    console.log("Line no 41");
    
    // Create new user
    const empId = generateUUID();
    const userData = {
      empId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      role: department,
      department,
      status: "active",
      password,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    console.log("-----55--------", userData);
    await User.create(userData);

    // Return user data without password
    const { password: _, ...newUser } = userData;
    res.status(201).json(newUser);
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    const { email } = req.body;
    console.log("Extracted email:", email);

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }
    else {
      //Return User data
      const { ...newUser } = user;
      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    const { email, newPassword } = req.body;
    console.log("Extracted email:", email);
    console.log("Extracted New Password:", newPassword);

    const result = await User.updatePassword(email, newPassword);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};