import { Router, type IRouter } from "express";
import {
  GetPhoneParams,
  GetPhoneResponse,
  ListPhonesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type SupabasePhone = {
  id: string;
  brand: string;
  model: string;
  image: string;
  price: number;
  rating: number;
  release_year: number;
  color: string;
  display: string;
  processor: string;
  ram: string;
  storage: string;
  cameras: string;
  battery: string;
  charging: string;
  os: string;
  supports_5g: boolean;
};

function toPhone(row: SupabasePhone) {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    image: row.image,
    price: Number(row.price),
    rating: Number(row.rating),
    releaseYear: row.release_year,
    color: row.color,
    display: row.display,
    processor: row.processor,
    ram: row.ram,
    storage: row.storage,
    cameras: row.cameras,
    battery: row.battery,
    charging: row.charging,
    os: row.os,
    "5g": row.supports_5g,
  };
}

async function getSupabaseRows(params: URLSearchParams): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error("Supabase catalog is not configured");
  }

  return fetch(`${supabaseUrl}/rest/v1/phone_compare_catalog?${params.toString()}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
  });
}

async function upstreamErrorDetails(upstream: Response): Promise<{
  code?: string;
  message?: string;
}> {
  try {
    const body: unknown = await upstream.json();
    if (!body || typeof body !== "object") return {};
    const record = body as Record<string, unknown>;
    return {
      ...(typeof record.code === "string" ? { code: record.code } : {}),
      ...(typeof record.message === "string"
        ? { message: record.message.slice(0, 300) }
        : {}),
    };
  } catch {
    return {};
  }
}

router.get("/phones", async (req, res): Promise<void> => {
  try {
    const params = new URLSearchParams({
      select:
        "id,brand,model,image,price,rating,release_year,color,display,processor,ram,storage,cameras,battery,charging,os,supports_5g",
      order: "brand.asc,model.asc",
    });
    const upstream = await getSupabaseRows(params);
    if (!upstream.ok) {
      req.log.error(
        { status: upstream.status, ...(await upstreamErrorDetails(upstream)) },
        "Supabase phone catalog request failed",
      );
      res.status(502).json({ error: "Could not load the phone catalog." });
      return;
    }

    const rows = (await upstream.json()) as SupabasePhone[];
    res.json(ListPhonesResponse.parse(rows.map(toPhone)));
  } catch (error) {
    if (error instanceof Error && error.message === "Supabase catalog is not configured") {
      req.log.error("Supabase phone catalog is not configured");
      res.status(503).json({ error: "Phone catalog is not configured." });
      return;
    }
    req.log.error({ err: error }, "Supabase phone catalog request failed");
    res.status(502).json({ error: "Could not load the phone catalog." });
  }
});

router.get("/phones/:id", async (req, res): Promise<void> => {
  const parsedParams = GetPhoneParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  try {
    const params = new URLSearchParams({
      select:
        "id,brand,model,image,price,rating,release_year,color,display,processor,ram,storage,cameras,battery,charging,os,supports_5g",
      id: `eq.${parsedParams.data.id}`,
      limit: "1",
    });
    const upstream = await getSupabaseRows(params);
    if (!upstream.ok) {
      req.log.error(
        { status: upstream.status, ...(await upstreamErrorDetails(upstream)) },
        "Supabase phone detail request failed",
      );
      res.status(502).json({ error: "Could not load phone details." });
      return;
    }

    const rows = (await upstream.json()) as SupabasePhone[];
    if (rows.length === 0) {
      res.status(404).json({ error: "Phone not found." });
      return;
    }
    res.json(GetPhoneResponse.parse(toPhone(rows[0])));
  } catch (error) {
    if (error instanceof Error && error.message === "Supabase catalog is not configured") {
      req.log.error("Supabase phone catalog is not configured");
      res.status(503).json({ error: "Phone catalog is not configured." });
      return;
    }
    req.log.error({ err: error }, "Supabase phone detail request failed");
    res.status(502).json({ error: "Could not load phone details." });
  }
});

export default router;
