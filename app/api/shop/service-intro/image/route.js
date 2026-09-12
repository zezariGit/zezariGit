import { catalogImageResponse } from "../../../../../lib/catalog-image-response";
import { getProductServiceIntroImage } from "../../../../../lib/db";

export async function GET() {
  const image = await getProductServiceIntroImage();
  return catalogImageResponse(image, "product-service-intro");
}
