"use client";

import { useMemo, useState } from "react";
import FormSubmitButton from "../form-submit-button";
import {
  setGlobalProductDesignCatalogItemAction,
  setProductCatalogItemAction,
} from "./actions";

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "product", label: "상품" },
  { id: "design", label: "디자인" },
];

const PRODUCT_DEFAULT_IMAGES = {
  sticker: "/assets/shop-icons/product-sticker.png",
  bracelet: "/assets/shop-icons/product-bracelet.png",
  necklace: "/assets/shop-icons/product-necklace.png",
  keyring: "/assets/shop-icons/product-keyring.png",
  "bracelet-necklace": "/assets/shop-icons/product-bracelet-necklace.png",
  "necklace-keyring": "/assets/shop-icons/product-necklace-keyring.png",
  "bracelet-necklace-keyring": "/assets/shop-icons/product-bracelet-necklace-keyring.png",
};

const DESIGN_DEFAULT_IMAGES = {
  쥐: "/assets/shop-icons/zodiac-rat.png",
  소: "/assets/shop-icons/zodiac-ox.png",
  호랑이: "/assets/shop-icons/zodiac-tiger.png",
  토끼: "/assets/shop-icons/zodiac-rabbit.png",
  용: "/assets/shop-icons/zodiac-dragon.png",
  뱀: "/assets/shop-icons/zodiac-snake.png",
  말: "/assets/shop-icons/zodiac-horse.png",
  양: "/assets/shop-icons/zodiac-sheep.png",
  원숭이: "/assets/shop-icons/zodiac-monkey.png",
  닭: "/assets/shop-icons/zodiac-rooster.png",
  개: "/assets/shop-icons/zodiac-dog.png",
  돼지: "/assets/shop-icons/zodiac-pig.png",
};

export default function ProductAdminWorkspace({ products = [], designs = [], initialItemKey = "" }) {
  const items = useMemo(() => [
    ...products.map((item) => ({ ...item, type: "product", key: `product:${item.id}` })),
    ...designs.map((item) => ({ ...item, type: "design", key: `design:${item.id}` })),
  ], [products, designs]);
  const initialItem = items.find((item) => item.key === initialItemKey) || items[0] || null;
  const [filter, setFilter] = useState("all");
  const [selectedKey, setSelectedKey] = useState(initialItem?.key || "");
  const visibleItems = filter === "all" ? items : items.filter((item) => item.type === filter);
  const selectedItem = items.find((item) => item.key === selectedKey) || visibleItems[0] || null;

  const selectFilter = (nextFilter) => {
    setFilter(nextFilter);
    const firstVisible = nextFilter === "all" ? items[0] : items.find((item) => item.type === nextFilter);
    if (selectedItem?.type !== nextFilter && nextFilter !== "all" && firstVisible) {
      setSelectedKey(firstVisible.key);
      updateSelectedCatalogUrl(firstVisible.key);
    }
  };

  const selectItem = (item) => {
    setSelectedKey(item.key);
    updateSelectedCatalogUrl(item.key);
  };

  return (
    <div className="product-management-layout catalog-independent-layout">
      <section className="product-catalog-grid-panel" aria-label="상품 및 디자인 목록">
        <div className="product-catalog-toolbar catalog-filter-toolbar">
          <div>
            <h3>상품/디자인 목록</h3>
            <span>상품 {products.length}개 · 디자인 {designs.length}개</span>
          </div>
          <div className="catalog-type-filters" role="tablist" aria-label="카탈로그 구분">
            {FILTERS.map((item) => (
              <button
                aria-selected={filter === item.id}
                className={filter === item.id ? "active" : ""}
                key={item.id}
                onClick={() => selectFilter(item.id)}
                role="tab"
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-management-grid" role="list">
          {visibleItems.map((item) => (
            <button
              aria-pressed={selectedItem?.key === item.key}
              className={selectedItem?.key === item.key ? "selected" : ""}
              key={item.key}
              onClick={() => selectItem(item)}
              role="listitem"
              type="button"
            >
              <span className={`catalog-type-badge ${item.type}`}>{item.type === "product" ? "상품" : "디자인"}</span>
              <span className="catalog-management-image">
                <img src={catalogItemImage(item)} alt="" />
              </span>
              <strong>{item.name}</strong>
              <em>{catalogPriceLabel(item)}</em>
            </button>
          ))}
        </div>
      </section>

      <aside className="product-management-detail-panel" aria-label="상품 또는 디자인 상세 편집">
        {selectedItem ? <CatalogItemEditor item={selectedItem} key={selectedItem.key} /> : (
          <p className="product-catalog-empty">관리할 항목이 없습니다.</p>
        )}
      </aside>
    </div>
  );
}

function CatalogItemEditor({ item }) {
  const isProduct = item.type === "product";
  const action = isProduct ? setProductCatalogItemAction : setGlobalProductDesignCatalogItemAction;

  return (
    <div className="product-admin-editor catalog-item-editor">
      <div className="product-admin-editor-heading">
        <div className="product-admin-editor-summary">
          <div className="product-admin-editor-thumb">
            <img src={catalogItemImage(item)} alt="" />
          </div>
          <div>
            <span>{isProduct ? "상품" : "디자인"} 상세</span>
            <h3>{item.name}</h3>
            <small>{catalogPriceLabel(item)}</small>
          </div>
        </div>
        <span className={`catalog-type-badge ${item.type}`}>{isProduct ? "상품" : "디자인"}</span>
      </div>

      <form action={action} className="product-admin-form product-admin-editor-form">
        <input type="hidden" name="returnTo" value={`/admin?section=products&item=${encodeURIComponent(item.key)}`} />
        {isProduct ? (
          <>
            <input type="hidden" name="productId" value={item.id} />
            <input type="hidden" name="description" value={item.description || ""} />
            <input type="hidden" name="sortOrder" value={item.sort_order || 0} />
            <input type="hidden" name="isActive" value="1" />
            <input type="hidden" name="designCount" value="0" />
          </>
        ) : <input type="hidden" name="designId" value={item.id} />}

        <div className="product-admin-detail-scroll catalog-item-fields">
          <label>
            {isProduct ? "상품 명칭" : "디자인 명칭"}
            <input name="name" defaultValue={item.name || ""} required />
          </label>
          <label>
            가격
            <input
              name="unitPrice"
              type="number"
              min="0"
              step="100"
              defaultValue={item.unit_price ?? ""}
              placeholder={isProduct ? "상품 가격" : "미입력 시 상품 가격 사용"}
              required={isProduct}
            />
            {!isProduct && <small>비워두면 선택한 상품의 가격을 사용합니다.</small>}
          </label>

          <section className="catalog-image-editor">
            <strong>{isProduct ? "상품 이미지" : "디자인 이미지"}</strong>
            <div className="catalog-image-preview">
              <img src={catalogItemImage(item)} alt={`${item.name} 현재 이미지`} />
            </div>
            <label>
              이미지 파일 변경
              <input name="image" type="file" accept="image/*" />
              <small>정사각형 이미지 권장, 1MB 이하</small>
            </label>
            <label className="product-design-admin-check">
              <input name="removeImage" type="checkbox" value="1" />
              <span>업로드 이미지 삭제 후 기본 이미지 사용</span>
            </label>
          </section>
        </div>

        <div className="product-admin-editor-footer">
          <FormSubmitButton pendingText="저장중">{isProduct ? "상품" : "디자인"} 정보 저장</FormSubmitButton>
        </div>
      </form>
    </div>
  );
}

function catalogItemImage(item) {
  if (item.type === "product") {
    if (item.image_data_url) return item.image_data_url;
    return PRODUCT_DEFAULT_IMAGES[item.slug] || "/assets/dashboard-action-shop.png";
  }
  if (item.option_image_data_url) return item.option_image_data_url;
  const designNames = Object.keys(DESIGN_DEFAULT_IMAGES);
  const catalogIndex = Number(String(item.id || "").match(/^design-catalog-zodiac-(\d+)$/)?.[1] || 0) - 1;
  return DESIGN_DEFAULT_IMAGES[designNames[catalogIndex]]
    || DESIGN_DEFAULT_IMAGES[String(item.name || "").trim()]
    || "/assets/shop-icons/zodiac-rabbit.png";
}

function catalogPriceLabel(item) {
  if (item.type === "design" && (item.unit_price === null || item.unit_price === undefined || item.unit_price === "")) {
    return "상품 가격 사용";
  }
  return `${Number(item.unit_price || 0).toLocaleString("ko-KR")}원`;
}

function updateSelectedCatalogUrl(itemKey) {
  if (typeof window === "undefined") return;
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("section", "products");
  if (itemKey) nextUrl.searchParams.set("item", itemKey);
  else nextUrl.searchParams.delete("item");
  nextUrl.searchParams.delete("product");
  window.history.replaceState(window.history.state, "", nextUrl);
}
