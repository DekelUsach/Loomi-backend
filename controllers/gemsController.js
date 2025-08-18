// controllers/gemsController.js
import supabase from '../config/supabaseClient.js';

/* Gems */
// GET /gems/:id
export async function getGems(req, res) {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(400).json({ error: 'Missing user_id parameter' });
    }
    const { data, error } = await supabase
        .from('Users')
        .select('gems')
        .eq('user_id', user_id)
        .single();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'User not found' });
    return res.json({ gems: data.gems });
}