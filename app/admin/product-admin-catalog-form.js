"use client";

import { useMemo, useState } from "react";
import FormSubmitButton from "../form-submit-button";
import { createProductCatalogItemAction, setProductCatalogItemAction } from "./actions";

export default function ProductAdminWorkspace({ products = [], initialProductId = "" }) {
  const initialProduct = products.find((product) => product.id === initialProductId) || products[0] || null;
  const [selectedProductId, setSelectedProductId] = useState(initialProduct?.id || "");
  const [mode, setMode] = useState(initialProduct ? "edit" : "create");
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || products[0] || null,
    [products, selectedProductId],
  );
  const nextSortOrder = products.reduce(
    (max, product) => Math.max(max, Number(product.sort_order || 0)),
    0,
  ) + 1;

  const selectProduct = (productId) => {
    setSelectedProductId(productId);
    setMode("edit");
    updateSelectedProductUrl(productId);
  };

  const openCreateForm = () => {
    setMode("create");
    updateSelectedProductUrl("");
  };

  return (
    <div className="product-management-layout">
      <section className="product-catalog-grid-panel" aria-label="상품 목록">
        <div className="product-catalog-toolbar">
          <div>
            <h3>상품 목록</h3>
            <span>사용자 상품 선택창과 동일한 카탈로그입니다.</span>
          </div>
          <button className="plain-button compact" type="button" onClick={openCreateForm}>
            + 새 상품
          </button>
        </div>

        <div className="product-catalog-table-scroll">
          <table className="product-catalog-table">
            <thead>
              <tr>
                <th scope="col">선택</th>
                <th scope="col">썸네일</th>
                <th scope="col">상품명</th>
                <th scope="col">가격</th>
                <th scope="col">노출</th>
                <th scope="col">정렬</th>
                <th scope="col">상세페이지</th>
                <th scope="col">관리</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td className="product-catalog-empty" colSpan="8">
                    등록된 상품이 없습니다. 새 상품을 추가해 주세요.
                  </td>
                </tr>
              ) : products.map((product) => {
                const isSelected = mode === "edit" && selectedProduct?.id === product.id;
                return (
                  <tr
                    aria-selected={isSelected}
                    className={isSelected ? "is-selected" : ""}
                    key={product.id}
                    onClick={() => selectProduct(product.id)}
                    onKeyDown={(event) => {
                      if (event.currentTarget !== event.target || (event.key !== "Enter" && event.key !== " ")) return;
                      event.preventDefault();
                      selectProduct(product.id);
                    }}
                    tabIndex="0"
                  >
                    <td>
                      <input
                        aria-label={`${product.name} 선택`}
                        checked={isSelected}
                        name="selectedProduct"
                        onChange={() => selectProduct(product.id)}
                        type="radio"
                      />
                    </td>
                    <td>
                      <div className="product-catalog-thumb">
                        {product.image_data_url ? (
                          <img src={product.image_data_url} alt="" />
                        ) : (
                          <ProductAdminFallback product={product} />
                        )}
                      </div>
                    </td>
                    <td>
                      <strong className="product-catalog-name">{product.name || "상품명 미입력"}</strong>
                      <small>{product.description || "설명 없음"}</small>
                    </td>
                    <td className="product-catalog-price">{formatCurrency(product.unit_price)}</td>
                    <td>
                      <span className={`product-catalog-status ${product.is_active !== 0 ? "active" : "inactive"}`}>
                        {product.is_active !== 0 ? "노출" : "숨김"}
                      </span>
                    </td>
                    <td>{Number(product.sort_order || 0)}</td>
                    <td>
                      <span className={`product-catalog-detail-state ${Number(product.has_detail_image || 0) === 1 ? "ready" : "empty"}`}>
                        {Number(product.has_detail_image || 0) === 1 ? "등록" : "미등록"}
                      </span>
                    </td>
                    <td>
                      <button className="plain-button compact" type="button" onClick={() => selectProduct(product.id)}>
                        상세
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="product-management-detail-panel" aria-label="상품 상세 편집">
        {mode === "create" ? (
          <ProductAdminCreateForm defaultSortOrder={nextSortOrder} onCancel={() => selectedProduct && selectProduct(selectedProduct.id)} />
        ) : selectedProduct ? (
          <ProductAdminCatalogForm product={selectedProduct} key={selectedProduct.id} />
        ) : (
          <ProductAdminCreateForm defaultSortOrder={nextSortOrder} />
        )}
      </aside>
    </div>
  );
}

export function ProductAdminCreateForm({ defaultSortOrder = 1, onCancel }) {
  return (
    <div className="product-admin-editor">
      <div className="product-admin-editor-heading">
        <div>
          <span>상품 등록</span>
          <h3>새 상품</h3>
        </div>
        {onCancel ? (
          <button className="plain-button compact" type="button" onClick={onCancel}>
            취소
          </button>
        ) : null}
      </div>
      <form action={createProductCatalogItemAction} className="product-admin-create-form">
        <input type="hidden" name="returnTo" value="/admin?section=products" />
        <div className="product-admin-detail-scroll">
          <div className="product-admin-create-fields">
            <label>
              상품명
              <input name="name" placeholder="구매 화면에 표시할 상품명" required />
            </label>
            <label>
              상품 가격
              <input name="unitPrice" type="number" min="0" step="100" defaultValue="0" required />
            </label>
          </div>
          <label>
            설명
            <textarea name="description" rows="3" placeholder="상품 선택과 주문 화면에 표시할 설명" />
          </label>
          <label>
            정렬 순서
            <input name="sortOrder" type="number" step="1" defaultValue={defaultSortOrder} />
          </label>
          <div className="product-admin-create-fields media">
            <label>
              상품 썸네일
              <input name="image" type="file" accept="image/*" />
              <small>사용자 상품 선택 화면용, 1MB 이하</small>
            </label>
            <label>
              긴 상세페이지 이미지
              <input name="detailImage" type="file" accept="image/*" />
              <small>세로형 원본 비율 유지, 4MB 이하</small>
            </label>
          </div>
          <label className="product-admin-create-active">
            <input name="isActive" type="checkbox" value="1" defaultChecked />
            <span>추가 즉시 사용자 상품 selectbox에 노출</span>
          </label>
          <p className="product-admin-editor-note">상품을 추가하면 디자인 관리용 12간지 항목이 자동으로 생성됩니다.</p>
        </div>
        <div className="product-admin-editor-footer">
          <FormSubmitButton pendingText="추가중">상품 추가</FormSubmitButton>
        </div>
      </form>
    </div>
  );
}

export function ProductAdminCatalogForm({ product }) {
  const [activeTab, setActiveTab] = useState("product");
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
    setActiveTab("designs");
  };

  const removeDraftDesign = (draftKey) => {
    setDraftDesigns((items) => items.filter((item) => item.draftKey !== draftKey));
  };

  return (
    <div className="product-admin-editor">
      <div className="product-admin-editor-heading">
        <div className="product-admin-editor-summary">
          <div className="product-admin-editor-thumb">
            {product.image_data_url ? (
              <img src={product.image_data_url} alt="" />
            ) : (
              <ProductAdminFallback product={product} />
            )}
          </div>
          <div>
            <span>상품 상세 정보</span>
            <h3>{product.name}</h3>
            <small>{formatCurrency(product.unit_price)} · 디자인 {existingDesigns.length}개</small>
          </div>
        </div>
        <span className={`product-catalog-status ${product.is_active !== 0 ? "active" : "inactive"}`}>
          {product.is_active !== 0 ? "노출" : "숨김"}
        </span>
      </div>

      <div className="product-admin-tabs" role="tablist" aria-label="상품 상세 메뉴">
        <button
          aria-selected={activeTab === "product"}
          className={activeTab === "product" ? "active" : ""}
          onClick={() => setActiveTab("product")}
          role="tab"
          type="button"
        >
          상품 정보
        </button>
        <button
          aria-selected={activeTab === "designs"}
          className={activeTab === "designs" ? "active" : ""}
          onClick={() => setActiveTab("designs")}
          role="tab"
          type="button"
        >
          디자인 관리 ({designRows.length})
        </button>
      </div>

      <form action={setProductCatalogItemAction} className="product-admin-form product-admin-editor-form">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="returnTo" value={`/admin?section=products&product=${encodeURIComponent(product.id)}`} />
        <input type="hidden" name="designCount" value={designRows.length} />

        <div className="product-admin-detail-scroll">
          <div className="product-admin-tab-panel" hidden={activeTab !== "product"} role="tabpanel">
            <div className="product-admin-create-fields">
              <label>
                상품명
                <input name="name" defaultValue={product.name || ""} required />
              </label>
              <label>
                상품 가격
                <input name="unitPrice" type="number" min="0" step="100" defaultValue={product.unit_price || 0} />
              </label>
            </div>
            <label>
              설명
              <textarea name="description" rows="3" defaultValue={product.description || ""} placeholder="상품 설명" />
            </label>
            <label>
              정렬 순서
              <input name="sortOrder" type="number" step="1" defaultValue={product.sort_order || 0} />
            </label>

            <div className="product-admin-upload-grid">
              <section>
                <strong>상품 썸네일</strong>
                <div className="product-admin-preview">
                  {product.image_data_url ? (
                    <img src={product.image_data_url} alt={`${product.name} 상품 썸네일`} />
                  ) : (
                    <ProductAdminFallback product={product} />
                  )}
                </div>
                <input name="image" type="file" accept="image/*" />
                <small>사용자 상품 선택 화면용, 1MB 이하</small>
                <label className="product-design-admin-check">
                  <input name="removeImage" type="checkbox" value="1" />
                  <span>기존 썸네일 삭제</span>
                </label>
              </section>
              <section>
                <strong>긴 상세페이지</strong>
                <input name="detailImage" type="file" accept="image/*" />
                <small>세로형 원본 비율 유지, 4MB 이하</small>
                <label className="product-design-admin-check">
                  <input name="removeDetailImage" type="checkbox" value="1" />
                  <span>기존 상세페이지 삭제</span>
                </label>
              </section>
            </div>

            <label className="product-admin-create-active">
              <input name="isActive" type="checkbox" value="1" defaultChecked={product.is_active !== 0} />
              <span>사용자 상품 selectbox에 노출</span>
            </label>

            <div className="product-admin-detail-preview">
              <strong>상세페이지 미리보기</strong>
              {Number(product.has_detail_image || 0) === 1 ? (
                <img src={productDetailImageUrl(product)} alt={`${product.name} 상세페이지 이미지`} />
              ) : (
                <span>등록된 상품 상세페이지 이미지가 없습니다.</span>
              )}
            </div>
          </div>

          <div className="product-admin-tab-panel" hidden={activeTab !== "designs"} role="tabpanel">
            <fieldset className="product-design-admin-list">
              <legend>디자인별 이미지와 상세페이지</legend>
              <div className="product-design-admin-title">
                <span>각 디자인의 이름, 가격, 썸네일과 상세 이미지를 관리합니다.</span>
                <button className="plain-button compact" type="button" onClick={addDesign}>
                  + 디자인 추가
                </button>
              </div>

              {designRows.length === 0 && (
                <p className="product-design-empty">등록된 디자인이 없습니다. 디자인 추가 버튼으로 필요한 디자인을 추가해 주세요.</p>
              )}

              {designRows.map((design, index) => (
                <div className="product-design-admin-row" key={design.id || design.draftKey}>
                  <input type="hidden" name={`designId_${index}`} value={design.id || ""} />
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
                    <input name={`designName_${index}`} defaultValue={design.name || ""} placeholder="예: 소 디자인" />
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
          </div>
        </div>

        <div className="product-admin-editor-footer">
          <FormSubmitButton pendingText="저장중">상품 정보 저장</FormSubmitButton>
        </div>
      </form>
    </div>
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

function productDetailImageUrl(product) {
  const version = encodeURIComponent(String(product?.updated_at || ""));
  return `/api/products/${encodeURIComponent(product.id)}/detail?v=${version}`;
}

function updateSelectedProductUrl(productId) {
  if (typeof window === "undefined") return;
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("section", "products");
  if (productId) nextUrl.searchParams.set("product", productId);
  else nextUrl.searchParams.delete("product");
  window.history.replaceState(window.history.state, "", nextUrl);
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}
