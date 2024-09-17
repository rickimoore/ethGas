import axios from 'axios';
import { NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL

export async function GET() {
  try {
    const res = await axios.get(`${backendUrl}/recommendations`);

    if(!res?.data) {
      return NextResponse.json({ error: 'authPrompt.unableToReach' }, { status: 500 })
    }

    return NextResponse.json(res.data, {status: 200})
  } catch (error: any) {
    let message = error?.response?.data?.message

    if(!message) {
      message = 'authPrompt.defaultErrorMessage'
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}