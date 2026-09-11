export default function ServiceRegulationDocument({ document }) {
  return (
    <div className="service-regulation-document">
      {document.blocks.map((block, index) => (
        <p
          className={block.bold ? "is-bold" : ""}
          key={`${document.id}-${index}`}
          style={{ fontSize: `${block.fontSize}px` }}
        >
          {block.text}
        </p>
      ))}
    </div>
  );
}
