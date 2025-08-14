// controllers/energyAndGemsController.js
import supabase from '../config/supabaseClient.js';

export const MAX_ENERGY = 100;
export const UPDATE_TIME = 1 * 60 * 1000; // 1 minuto para recargar. Para cambiarlo, el formato es: Minutos * Segundos *  Constante de Milisegundos.

/* Energy */
//Esta función local es para calcular la energía en base a la ultima vez que se actualizó.
const updateEnergy = (_energyNow, _lastUpdate) => {
    const now = Date.now();
    const lastUpdate = new Date(_lastUpdate).getTime();

    // Checkeo de datos en caso de que alguno de los parametros se haya corrompido o este mal.
    if (isNaN(lastUpdate)) {
        return {
            energy: _energyNow,
            lastEnergyUpdate: new Date().toISOString(),
            nextUpdateIn: UPDATE_TIME,
        };
    }

    const transcurredTime = now - lastUpdate;

    // Esto calcula cuantos intervalos de UPDATE_TIME pasaron.
    const energyGained = Math.floor(transcurredTime / UPDATE_TIME);

    // Esto suma la energía actual del usuario con la que se le añade, limitada por MAX_ENERGY.
    const newEnergy = Math.min(_energyNow + energyGained, MAX_ENERGY);

    // Solo se actualiza la fecha si aumentó la energía.
    const newLastEnergyUpdate = new Date(
        lastUpdate + energyGained * UPDATE_TIME
    ).toISOString();

    const nextUpdateIn = UPDATE_TIME - (transcurredTime % UPDATE_TIME);

    return {
        energy: newEnergy,
        lastEnergyUpdate: newLastEnergyUpdate,
        nextUpdateIn, // en milisegundos
        energyGained: energyGained
    };
}

// GET /energy/:id
export async function getEnergy(req, res) {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: 'Missing user_id parameter' });
    }

    const { data, error } = await supabase
        .from('Users')
        .select('energy, lastEnergyUpdate')
        .eq('user_id', user_id)
        .single();

    if (error) return res.status(500).json({ error });
    if (!data) return res.status(404).json({ error: 'User not found' });

    const result = updateEnergy(
        data.energy,
        data.lastEnergyUpdate
    );

    const energyReachedMax = result.energy >= MAX_ENERGY;
    const energyChanged = result.energy !== data.energy;
    const lastUpdateChanged = result.lastEnergyUpdate !== data.lastEnergyUpdate;

    try {
        if (energyChanged || (energyReachedMax && lastUpdateChanged)) {
            await supabase
                .from('Users')
                .update({
                    energy: result.energy,
                    lastEnergyUpdate: result.lastEnergyUpdate,
                })
                .eq('user_id', user_id);
        }
    } catch (updateError) {
    console.error('Error updating energy:', updateError);
    }

    return res.json({
        energy: result.energy,
        nextUpdateIn: result.nextUpdateIn,
    });
}

/* Gems */
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