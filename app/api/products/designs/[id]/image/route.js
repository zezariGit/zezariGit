import { getProductDesignCatalogImage } from "../../../../../../lib/db";
import { catalogImageResponse } from "../../../../../../lib/catalog-image-response";

export async function GET(_request, { params }) {
  const { id } = await params;
  const image = await getProductDesignCatalogImage(id);
  return catalogImageResponse(image, "design-thumbnail");
}
