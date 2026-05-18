'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

// Check if admin is authenticated (by checking PIN, though in real app we'd use cookies, here we'll pass the pin to the action)
const ADMIN_PIN = process.env.ADMIN_PIN || '998768';

export async function verifyPin(pin) {
  return pin === ADMIN_PIN;
}

export async function getMembersAndRent() {
  try {
    const { rows: members } = await sql`SELECT * FROM members ORDER BY created_at ASC`;
    const { rows: records } = await sql`SELECT * FROM rent_records`;
    
    return { members, records, error: null };
  } catch (e) {
    console.error(e);
    return { members: [], records: [], error: 'Failed to fetch data. Is the database initialized?' };
  }
}

export async function addMember(pin, name) {
  if (pin !== ADMIN_PIN) throw new Error("Unauthorized");
  await sql`INSERT INTO members (name) VALUES (${name})`;
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function editMember(pin, id, name) {
  if (pin !== ADMIN_PIN) throw new Error("Unauthorized");
  await sql`UPDATE members SET name = ${name} WHERE id = ${id}`;
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deleteMember(pin, id) {
  if (pin !== ADMIN_PIN) throw new Error("Unauthorized");
  await sql`DELETE FROM members WHERE id = ${id}`;
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function updateRentStatus(pin, member_id, month_year, status, amount) {
  if (pin !== ADMIN_PIN) throw new Error("Unauthorized");
  
  await sql`
    INSERT INTO rent_records (member_id, month_year, status, amount)
    VALUES (${member_id}, ${month_year}, ${status}, ${amount})
    ON CONFLICT (member_id, month_year) 
    DO UPDATE SET status = EXCLUDED.status, amount = EXCLUDED.amount
  `;
  revalidatePath('/');
  revalidatePath('/admin');
}
