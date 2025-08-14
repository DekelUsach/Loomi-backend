// controllers/textController.js
import supabase from '../config/supabaseClient.js';

/* User Loaded Texts */
export const getAllUserTextsByUserId = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
    .from('userLoadedTexts')
    .select('*')
    .eq('userId', id)

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    const list = Array.isArray(data) ? data : [];
    res.status(200).json({ textList: { ...list } });
}

export const getAllUserParagraphsByIdText = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
    .from('userLoadedParagraphs')
    .select('*')
    .eq('idText', id)

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(Array.isArray(data) ? data : []);
}

export const insertUserText = async (req, res) => {
    const { title, userId } = req.body;
    const { data, error } = await supabase
    .from('userLoadedTexts')
    .insert([{
        title,
        userId
    }])
    .single();

    if (error) {
    return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
}

export const insertUserParagraphs = async (req, res) => {
    const { userId, paragraphs } = req.body;

    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
        return res.status(400).json({ error: "An array is required." });
    }

    if (!userId) {
        return res.status(400).json({ error: "userId parameter is required." });
    }

    
    try {
        const { count, error: countError } = await supabase
            .from('userLoadedTexts')
            .select('*', { count: 'exact', head: true })
            .eq('userId', userId);

        if (countError) {
            return res.status(500).json({ error: countError.message });
        }

        const idText = count;

        const insertData = paragraphs.map(({ content, imageURL, order }) => {
            const obj = {
                content,
                order,
                idText,
            };
      
            if (imageURL !== null && imageURL !== undefined) {
            obj.imageURL = imageURL;
            }

            return obj;
        });

        const { data, error } = await supabase
            .from('userLoadedParagraphs')
            .insert(insertData)

        if (error) {
        return res.status(500).json({ error: error.message });
        }

    res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Unexpected error: ' + err.message });
    }
}

/* Pre Loaded Texts */
export const getAllPreloadedTexts = async (_req, res) => {
    const { data, error } = await supabase
        .from('preLoadedTexts')
        .select('*')
        .order('id', { ascending: true });
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ list: Array.isArray(data) ? data : [] });
};

export const getLoadedTextsById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
    .from('preLoadedTexts')
    .select('*')
    .eq('id', id)

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Text not found' });
    }

    res.json(data);
};

export const getAllLoadedParagraphsByIdText = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
    .from('preLoadedParagraphs')
    .select('*')
    .eq('idText', id)

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Paragraphs not found' });
    }

    res.json(data);
}