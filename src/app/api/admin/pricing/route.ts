import { NextResponse } from 'next/server';
import { getPricingDb, saveFullPricingDb, PricingData } from '@/lib/store';

export async function GET() {
  try {
    const pricing = await getPricingDb();
    return NextResponse.json(pricing);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { category, plan, isDelete, planIndex } = await request.json();
    const pricing: PricingData = await getPricingDb();

    if (!category || !pricing[category as keyof PricingData]) {
      return NextResponse.json({ success: false, error: 'Invalid pricing category' }, { status: 400 });
    }

    const categoryPlans = pricing[category as keyof PricingData];

    if (isDelete) {
      if (typeof planIndex === 'number' && planIndex >= 0) {
        categoryPlans.splice(planIndex, 1);
      }
    } else if (plan) {
      if (typeof planIndex === 'number' && planIndex >= 0 && planIndex < categoryPlans.length) {
        categoryPlans[planIndex] = plan;
      } else {
        categoryPlans.push(plan);
      }
    }

    const updated = await saveFullPricingDb(pricing);
    return NextResponse.json({ success: true, pricing: updated });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return NextResponse.json({ success: false, error: 'Failed to update pricing' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const fullPricing: PricingData = await request.json();
    const updated = await saveFullPricingDb(fullPricing);
    return NextResponse.json({ success: true, pricing: updated });
  } catch (error) {
    console.error('Error saving full pricing:', error);
    return NextResponse.json({ success: false, error: 'Failed to update full pricing' }, { status: 500 });
  }
}
