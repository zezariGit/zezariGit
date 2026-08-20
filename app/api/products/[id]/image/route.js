import { getProductCatalogImage } from "../../../../../lib/db";
import { catalogImageResponse } from "../../../../../lib/catalog-image-response";

export async function GET(_request, { params }) {
  const { id } = await params;
  const image = await getProductCatalogImage(id);
  return catalogImageResponse(image, "product-thumbnail");
}
