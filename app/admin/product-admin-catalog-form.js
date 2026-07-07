"use client";

import { useState } from "react";
import FormSubmitButton from "../form-submit-button";
import { setProductCatalogItemAction } from "./actions";

export default function ProductAdminCatalogForm({ product }) {
  const [draftDesigns, setDraftDesigns] = useState([]);
  const existingDesigns = product.designs || [];
  const designRows = [...existingDesigns, ...draftDesigns];

  const addDesign = () => {
    setDraftDesigns((items) => [
      ...items,
      {
        draftKey: `draft-${Date.now()}-${items.length}`,
        id: "",
        name: "",
        description: "",
        sort_order: existingDesigns.length + items.length + 1,
        is_active: 1,
      },
    ]);
  };

  const removeDraftDesign = (draftKey) => {
    setDraftDesigns((items) => items.filter((item) => item.draftKey !== draftKey));
  };

  return (
    <article className="product-admin-card">
      <div className="product-admin-preview">
        {product.image_data_url ? (
          <img src={product.image_data_url} alt={`${product.name} 상품 이미지`} />
        ) : (
          <ProductAdminFallback product={product} />
        )}
      </div>

      <form action={setProductCatalogItemAction} className="product-admin-form">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="returnTo" value="/admin?section=products" />
        <input type="hidden" name="existingImage" value={product.image_data_url || ""} />
        <input type="hidden" name="existingImageName" value={product.image_name || ""} />
        <input type="hidden" name="designCount" value={designRows.length} />

        <label>
          상품명
          <input name="name" defaultValue={product.name || ""} required />
        </label>
        <label>
          설명
          <input name="description" defaultValue={product.description || ""} placeholder="상품 설명" />
        </label>
        <label>
          단독 구매 기본 가격
          <input name="unitPrice" type="number" min="0" step="100" defaultValue={product.unit_price || 0} />
        </label>
        <label>
          정렬
          <input name="sortOrder" type="number" step="1" defaultValue={product.sort_order || 0} />
        </label>
        <label>
          상품 대표 이미지
          <input name="image" type="file" accept="image/*" />
        </label>
        <div className="product-admin-options">
          <label>
            <input name="isActive" type="checkbox" value="1" defaultChecked={product.is_active !== 0} />
            <span>사용자 화면에 노출</span>
          </label>
          <label>
            <input name="removeImage" type="checkbox" value="1" />
            <span>대표 이미지 삭제</span>
          </label>
        </div>

        <fieldset className="product-design-admin-list">
          <legend>디자인별 이미지와 상세페이지</legend>
          <div className="product-design-admin-title">
            <span>필요한 디자인만 하나씩 추가해 관리합니다.</span>
            <button className="plain-button compact" type="button" onClick={addDesign}>
              + 디자인 추가
            </button>
          </div>

          {designRows.length === 0 && (
            <p className="product-design-empty">등록된 디자인이 없습니다. 디자인 추가 버튼으로 필요한 디자인만 추가해 주세요.</p>
          )}

          {designRows.map((design, index) => (
            <div className="product-design-admin-row" key={design.id || design.draftKey}>
              <input type="hidden" name={`designId_${index}`} value={design.id || ""} />
              <input type="hidden" name={`existingDesignOptionImage_${index}`} value={design.option_image_data_url || ""} />
              <input type="hidden" name={`existingDesignOptionImageName_${index}`} value={design.option_image_name || ""} />
              <input type="hidden" name={`existingDesignDetailImage_${index}`} value={design.detail_image_data_url || ""} />
              <input type="hidden" name={`existingDesignDetailImageName_${index}`} value={design.detail_image_name || ""} />
              <div className="product-design-admin-header">
                <strong>{design.id ? design.name || `디자인 ${index + 1}` : "신규 디자인"}</strong>
                <div className="product-design-admin-header-actions">
                  <label>
                    <input name={`designIsActive_${index}`} type="checkbox" value="1" defaultChecked={design.is_active !== 0} />
                    <span>노출</span>
                  </label>
                  {!design.id && (
                    <button className="plain-button compact" type="button" onClick={() => removeDraftDesign(design.draftKey)}>
                      제거
                    </button>
                  )}
                </div>
              </div>
              <label>
                디자인명
                <input name={`designName_${index}`} defaultValue={design.name || ""} placeholder="예: 강아지 디자인" />
              </label>
              <label>
                설명
                <input name={`designDescription_${index}`} defaultValue={design.description || ""} placeholder="상세페이지 설명" />
              </label>
              <div className="product-design-admin-fields">
                <label>
                  디자인 가격
                  <input name={`designUnitPrice_${index}`} type="number" min="0" step="100" defaultValue={design.unit_price ?? ""} placeholder="기본가 사용" />
                </label>
                <label>
                  정렬
                  <input name={`designSortOrder_${index}`} type="number" step="1" defaultValue={design.sort_order || index + 1} />
                </label>
              </div>
              <div className="product-design-admin-images">
                <div>
                  <span>선택 이미지</span>
                  <div className="product-design-admin-thumb">
                    {design.option_image_data_url ? (
                      <img src={design.option_image_data_url} alt={`${design.name || "디자인"} 선택 이미지`} />
                    ) : (
                      <ProductAdminFallback product={product} />
                    )}
                  </div>
                  <input name={`designOptionImage_${index}`} type="file" accept="image/*" />
                  <label className="product-design-admin-check">
                    <input name={`removeDesignOptionImage_${index}`} type="checkbox" value="1" />
                    <span>삭제</span>
                  </label>
                </div>
                <div>
                  <span>상세페이지 이미지</span>
                  <div className="product-design-admin-thumb detail">
                    {design.detail_image_data_url ? (
                      <img src={design.detail_image_data_url} alt={`${design.name || "디자인"} 상세 이미지`} />
                    ) : (
                      <ProductAdminFallback product={product} />
                    )}
                  </div>
                  <input name={`designDetailImage_${index}`} type="file" accept="image/*" />
                  <label className="product-design-admin-check">
                    <input name={`removeDesignDetailImage_${index}`} type="checkbox" value="1" />
                    <span>삭제</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </fieldset>

        <FormSubmitButton pendingText="저장중">
          상품/디자인 저장
        </FormSubmitButton>
      </form>
    </article>
  );
}

function ProductAdminFallback({ product }) {
  return <span aria-hidden="true">{productFallbackIcon(product.slug)}</span>;
}

function productFallbackIcon(slug) {
  if (slug === "sticker") return "★";
  if (slug === "bracelet") return "○";
  if (slug === "necklace") return "◎";
  if (slug === "keyring") return "●";
  return "상품";
}
