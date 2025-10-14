// ... existing routes ...

// ✅ NEW: Get user by ID (for fetching profile picture in chat)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;