import { supabase } from '../config/db.js';

export const loanService = {

  async create(body, user) {
    if (!user?.id) throw new Error('User tidak valid');

    const payload = {
      user_id: user.id,
      product_id: body.type === 'product' ? body.product_id : null,
      loan_amount: body.type === 'cash' ? body.loan_amount : null,
      tenure_month: body.tenure_month,
      interest_rate: body.interest_rate,
      monthly_payment: body.monthly_payment,
      type: body.type,
      status: 'pending',
      reason: body.reason || null,
      id_card_url: body.id_card_url || null
    };

    const { data, error } = await supabase
      .from('loans')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  },

  async getByUser(user) {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data;
  }
};