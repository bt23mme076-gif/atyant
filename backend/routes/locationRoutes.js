import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import auth from '../middleware/auth.js';

// ========== UPDATE USER LOCATION - FIXED FOR VILLAGES ==========
router.post('/update-location', auth, async (req, res) => {
  try {
    const { latitude, longitude, city, state, country } = req.body;

    console.log('========================================');
    console.log('📍 POST /update-location');
    console.log('User ID:', req.user.userId);
    console.log('📍 Received coordinates:', { latitude, longitude });
    console.log('========================================');

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    let finalCity = city;
    let finalState = state;
    let finalCountry = country || 'India';
    let finalDistrict = '';

    // ========== GEOCODING WITH VILLAGE PRIORITY ==========
    if (!city) {
      try {
        console.log('🔍 Fetching location from Nominatim...\n');
        
        // Use zoom 14 for better village detection
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'AtyantMentorApp/1.0 (contact@example.com)'
            }
          }
        );

        if (geoResponse.ok) {
          const data = await geoResponse.json();
          
          console.log('📍 Nominatim Response:');
          console.log('   Village:', data.address?.village);
          console.log('   Hamlet:', data.address?.hamlet);
          console.log('   Locality:', data.address?.locality);
          console.log('   Town:', data.address?.town);
          console.log('   City:', data.address?.city);
          console.log('   County:', data.address?.county);              // ← Tehsil/Taluka
          console.log('   State District:', data.address?.state_district); // ← District
          console.log('   State:', data.address?.state);
          console.log('   Country:', data.address?.country);
          console.log('');

          // ========== FIXED PRIORITY: village/hamlet > locality > town > county > city ==========
          // Village ko highest priority do, county (tehsil) ko last me
          
          const village = data.address?.village;
          const hamlet = data.address?.hamlet;
          const locality = data.address?.locality;
          const town = data.address?.town;
          const cityName = data.address?.city;
          const county = data.address?.county; // Tehsil
          const stateDistrict = data.address?.state_district;

          // Village ko highest priority - yeh fix hai
          if (village) {
            finalCity = village;
            console.log('✅ Using Village:', village);
          } else if (hamlet) {
            finalCity = hamlet;
            console.log('✅ Using Hamlet:', hamlet);
          } else if (locality) {
            finalCity = locality;
            console.log('✅ Using Locality:', locality);
          } else if (town) {
            finalCity = town;
            console.log('✅ Using Town:', town);
          } else if (cityName) {
            finalCity = cityName;
            console.log('✅ Using City:', cityName);
          } else if (county) {
            finalCity = county;
            console.log('⚠️  Fallback to County (Tehsil):', county);
          } else {
            finalCity = 'Unknown Location';
            console.log('❌ No location name found');
          }

          // District
          finalDistrict = stateDistrict || '';
          
          // State & Country
          finalState = data.address?.state || 'Madhya Pradesh';
          finalCountry = data.address?.country || 'India';

          console.log('\n📌 Final Selection:');
          console.log('   City/Village:', finalCity);
          console.log('   District:', finalDistrict || 'N/A');
          console.log('   State:', finalState);
          console.log('');

        } else {
          console.log('⚠️ Nominatim request failed\n');
          finalCity = `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        }

      } catch (geoError) {
        console.error('❌ Geocoding error:', geoError.message);
        finalCity = `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      }
    }

    // ========== SAVE TO DATABASE ==========
    const existingUser = await User.findById(req.user.userId);
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    existingUser.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
      city: finalCity,
      district: finalDistrict,
      state: finalState,
      country: finalCountry,
      lastUpdated: new Date()
    };

    await existingUser.save();

    console.log('✅ Location saved successfully:');
    console.log('   City/Village:', finalCity);
    console.log('   District:', finalDistrict);
    console.log('   State:', finalState);
    console.log('   Coordinates:', [longitude, latitude]);
    console.log('========================================\n');

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: existingUser.location
    });

  } catch (error) {
    console.error('❌ Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
});

// ========== GET USER LOCATION ==========
router.get('/my-location', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('location username');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hasLocation = user.location && 
                       user.location.coordinates && 
                       user.location.coordinates.length === 2;

    res.json({
      success: true,
      location: user.location || null,
      hasLocation: hasLocation
    });

  } catch (error) {
    console.error('❌ Error fetching location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location'
    });
  }
});

// ========== NEARBY MENTORS ==========
router.post('/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 100000 } = req.body;

    console.log('\n========================================');
    console.log('🔍 POST /nearby - Searching mentors');
    console.log('👤 User ID:', req.user.userId);
    console.log('📍 Search from:', { latitude, longitude });
    console.log('🔍 Max distance:', maxDistance / 1000, 'km');

    const currentUser = await User.findById(req.user.userId).select('username location');
    
    if (currentUser?.location?.coordinates) {
      const [savedLng, savedLat] = currentUser.location.coordinates;
      console.log('👤 User location:', currentUser.location.city);
      console.log('📍 Coordinates:', [savedLng, savedLat]);
    }

    console.log('========================================\n');

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const mentors = await User.find({
      role: 'mentor',
      _id: { $ne: req.user.userId },
      'location.coordinates': { $exists: true, $ne: [] }
    }).select('username profilePicture bio expertise skills location availableForOfflineMeet');

    console.log(`📍 Found ${mentors.length} mentors\n`);

    const mentorsWithDistance = [];

    for (const mentor of mentors) {
      if (!mentor.location?.coordinates || mentor.location.coordinates.length !== 2) {
        continue;
      }

      const [lng, lat] = mentor.location.coordinates;

      console.log('👨‍🏫', mentor.username);
      console.log('   📍', mentor.location.city);

      const distance = calculateDistance(latitude, longitude, lat, lng);

      console.log('   📏', (distance/1000).toFixed(2), 'km');

      if (distance <= maxDistance) {
        console.log('   ✅ Within range\n');
        mentorsWithDistance.push({
          ...mentor.toObject(),
          distance,
          distanceText: formatDistance(distance)
        });
      } else {
        console.log('   ❌ Too far\n');
      }
    }

    console.log('========================================');
    console.log(`✅ ${mentorsWithDistance.length} mentors within ${maxDistance/1000}km`);
    console.log('========================================\n');

    mentorsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      mentors: mentorsWithDistance,
      count: mentorsWithDistance.length
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby mentors',
      error: error.message
    });
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else if (meters < 10000) {
    return `${(meters / 1000).toFixed(1)} km`;
  } else {
    return `${Math.round(meters / 1000)} km`;
  }
}

export default router;