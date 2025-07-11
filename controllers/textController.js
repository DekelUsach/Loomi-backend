import supabase from '../config/supabaseClient.js';

//getAllUserTextsByUserId, getAllUserParagraphsByIdText, insertUserText, 

/* Preloaded */
export const getLoadedTextsById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
    .from('preloadedTexts')
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

