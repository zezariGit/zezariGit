# 실종자 광고 포스터 템플릿

## 렌더링 방식

서버 렌더러는 Next.js `ImageResponse`(`@vercel/og`, Satori + Resvg)를 사용한다.

| 항목 | ImageResponse / Satori | Playwright / Puppeteer |
| --- | --- | --- |
| Vercel 서버리스 | Chromium 없이 실행되어 빠르고 배포 용량이 작다. | Chromium 실행 비용과 콜드 스타트가 크다. |
| 좌표 기반 템플릿 | absolute 좌표와 제한된 CSS만 사용하면 결과가 결정적이다. | 브라우저 CSS 전체를 사용할 수 있으나 환경 차이와 로딩 대기가 생긴다. |
| 외부 사진/QR | 렌더링 전에 서버에서 읽어 data URL로 임베딩한다. | 페이지에서 URL을 직접 로드할 수 있으나 CORS와 로드 완료 대기가 필요하다. |
| 한글 글꼴 | WOFF 글꼴 데이터를 `fonts` 옵션으로 명시적으로 넣는다. | 페이지의 `@font-face` 로딩 완료를 기다려야 한다. |
| 자유로운 HTML/CSS | 지원하는 CSS가 제한적이다. | 실제 브라우저와 동일하다. |

제자리 포스터는 고정 크기 캔버스와 좌표 기반 요소가 핵심이므로 ImageResponse가 더 적합하다. 관리 화면과 실제 Meta 발행은 모두 같은 `renderPoster()`를 호출하므로 미리보기와 결과 이미지가 일치한다.

배경 이미지 업로드는 현재 프로젝트가 대상자 사진 등에 사용 중인 방식과 동일하게 검증된 image data URL을 `background_image_url`에 저장한다. 이후 Vercel Blob을 도입해도 이 컬럼에 Blob의 HTTPS URL을 저장하면 렌더러 변경 없이 사용할 수 있다.

## layout_json

캔버스 기본 크기는 기존 Meta 소재와 동일한 1080 x 1350(4:5)이다. 이미지 필드는 `objectFit`과 `borderRadius`, 텍스트 필드는 글꼴/색상/정렬/줄 수 정보를 가진다.

```json
{
  "canvas": { "width": 1080, "height": 1350 },
  "photo": { "x": 36, "y": 396, "width": 462, "height": 558, "objectFit": "cover", "borderRadius": 0 },
  "qr": { "x": 58, "y": 1079, "width": 236, "height": 236, "objectFit": "contain", "borderRadius": 0 },
  "name": { "x": 765, "y": 390, "width": 270, "height": 82, "fontSize": 62, "minFontSize": 34, "fontWeight": 800, "color": "#111111", "textAlign": "left", "maxLines": 1, "lineHeight": 1.1 },
  "age": { "x": 765, "y": 534, "width": 270, "height": 82, "fontSize": 52, "minFontSize": 30, "fontWeight": 700, "color": "#111111", "textAlign": "left", "maxLines": 1, "lineHeight": 1.1 },
  "gender": { "x": 765, "y": 678, "width": 270, "height": 82, "fontSize": 52, "minFontSize": 30, "fontWeight": 700, "color": "#111111", "textAlign": "left", "maxLines": 1, "lineHeight": 1.1 },
  "memo": { "x": 660, "y": 842, "width": 350, "height": 154, "fontSize": 35, "minFontSize": 22, "fontWeight": 700, "color": "#111111", "textAlign": "left", "maxLines": 4, "lineHeight": 1.24 }
}
```

보호자 메모는 `fontSize`에서 시작해 영역에 들어올 때까지 `minFontSize`까지 줄인다. 그래도 넘치면 `maxLines`에서 잘라 마지막 줄에 말줄임표를 붙인다.

## 버전과 발행 정책

- 활성 템플릿은 부분 유니크 인덱스로 항상 최대 1개만 허용한다.
- 저장할 때 덮어쓰기 전 상태를 `poster_template_versions`에 보관하고 활성 행의 `version`을 올린다.
- 배경 이미지를 교체하면 이전 배경 데이터는 템플릿 버전 이력에서 제거하고, 이름과 레이아웃 JSON 이력만 유지한다. 관리자 미리보기의 좌표 영역 테두리는 브라우저 오버레이이므로 실제 PNG에는 포함되지 않는다.
- 광고 신청 시 결제 화면 확인용 포스터를 서버에서 생성한다.
- Meta 최초 발행 직전에 최신 활성 템플릿으로 한 번 더 생성하고 `subject_ad_creatives`에 템플릿 ID, 버전, 레이아웃 JSON, 배경 주소를 스냅샷으로 저장한다.
- `meta_ad_id`가 생긴 소재는 템플릿이 바뀌어도 다시 생성하지 않는다.
- 발행에 실패해 아직 `meta_ad_id`가 없는 재시도는 최신 활성 템플릿을 사용한다.

이 방식은 단순 오버라이트보다 변경 추적이 가능하고, 이미 집행된 광고의 재현성을 보장한다.
