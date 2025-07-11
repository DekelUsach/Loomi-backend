import supabase from '../config/supabaseClient.js';

//getAllUserTextsByUserId, getAllUserParagraphsByIdText, insertUserText, 

/* User Loaded Texts */
export const getAllUserTextsByUserId = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
    .select('*')
    .from('userLoadedTexts')
    .eq('userId', id)

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Text not found' });
    }

    res.json(data);
}

export const getAllUserParagraphsByIdText = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
    .select('*')
    .from('userLoadedParagraphs')
    .eq('idText', id)

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Text not found' });
    }

    res.json(data);
}

export const insertUserText = async (req, res) => {
    const { title, userId } = req.params;
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
    const { userId } = req.params;
    const { title, paragraphs } = req.body;

    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
        return res.status(400).json({ error: "An array is required" });
    }

    const insertData = paragraphs.map(text => ({
        content,
        imageURL,
        order,
        idText,
    }));

    const { data, error } = await supabase
    .from('userLoadedParagraphs')
    .insert(insertData)

    if (error) {
    return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
}

/* Pre Loaded Texts */
export const getLoadedTextsById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
    .select('*')
    .from('preLoadedTexts')
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
    .select('*')
    .from('preLoadedParagraphs')
    .eq('idText', id)

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Paragraphs not found' });
    }

    res.json(data);
}

