const faqs = [
  {
    q: 'How is ScentQuest different from a regular squeaky toy?',
    a: 'A squeaky toy gives instant feedback the moment your dog bites it. ScentQuest makes your dog work for the reward using their nose. Scent work is slow, focused and mentally tiring in a way physical play rarely is — most dogs settle noticeably after one 15 to 20 minute session.',
  },
  {
    q: 'Which size should I buy for my dog?',
    a: 'Match the kit to your dog’s weight rather than their age. Small suits dogs under 8 kg, Medium suits 8 to 20 kg, Large suits 20 to 35 kg, and for heavier dogs the Backyard Trail Kit is built to be thrown, tugged and laid out at scale. The size guide on the Safety page has the full table.',
  },
  {
    q: 'How do I introduce a new scent game to my dog?',
    a: 'Start easy. Hide a high value treat in the easiest pocket, let your dog find it, and praise generously. Once they are finding treats quickly, swap in a scent capsule and lower the difficulty. Most dogs pick up the pattern within two or three sessions.',
  },
  {
    q: 'Are the scents safe for my dog?',
    a: 'Yes. Every capsule uses food-grade aromatic compounds in a sealed, chew-resistant casing that is not intended to be eaten. We do not use essential oils, alcohol, or anything that is unsafe if licked. Read the safety guidance before first use, and always supervise.',
  },
  {
    q: 'Do I need to supervise my dog while they play?',
    a: 'For the first few sessions, yes. Once your dog is reliably working the toy calmly rather than tearing at it, supervised play in a calm room is usually enough. The Trail Kit should always be used outdoors with an adult present.',
  },
  {
    q: 'How often should I use the toys?',
    a: 'Short and often beats long and rarely. Two or three 15 minute scent sessions a day is ideal. Leave a toy out for grazing if you like, but pick it up if your dog starts to chew the seams or the casing.',
  },
  {
    q: 'What does Cash on Delivery include?',
    a: 'You pay the delivery partner in cash when the order reaches you. There is no advance payment, no card on file and no auto-deduction. Please keep the exact amount ready if possible, as change may not always be available.',
  },
  {
    q: 'How long does delivery take, and is it free?',
    a: 'Orders are dispatched within 2 working days and typically reach you in 4 to 7 working days. Delivery is free on orders above ₹4,999. Below that, a flat ₹199 delivery charge applies and is shown before you place the order.',
  },
  {
    q: 'How do I track my order?',
    a: 'You will get an order ID such as SQ-03CBB615 on the confirmation screen right after checkout. Quote that ID if you contact us and we can pull up your order straight away.',
  },
  {
    q: 'What is your return policy?',
    a: 'If your order arrives damaged or is not what you ordered, contact us within 7 days with your order ID and we will replace it or refund you in full. For hygiene reasons we cannot accept returns of used scent toys, unless the item is faulty.',
  },
  {
    q: 'How do I clean the toys?',
    a: 'Remove any scent capsule first. Wipe the fabric with a damp cloth and a small amount of mild, unscented pet-safe detergent, then let it air dry completely. Do not machine wash, bleach, or tumble dry, as heat damages the fleece and the scent compartments.',
  },
  {
    q: 'Is this suitable for puppies and senior dogs?',
    a: 'It suits puppies because they are naturally motivated to sniff, and it suits senior dogs because the enrichment is low-impact on joints. Choose the Small size for puppies and remove all capsules from toys they might chew. Skip scent games for a dog who has recently had surgery or a respiratory illness.',
  },
]

const safetyPoints = [
  {
    title: 'Non-toxic materials',
    body: 'Fleece, webbing and stuffing are food-grade and free from BPA, phthalates and lead. Dyes are non-toxic. No essential oils, alcohol or aerosols are used anywhere in the range.',
  },
  {
    title: 'Always supervise',
    body: 'Keep an adult present during play. Do not leave a dog alone with a scent capsule or a toy they are actively tearing apart. If your dog chews the casing, take the toy away and replace the capsule.',
  },
  {
    title: 'Correct sizing matters',
    body: 'A toy that is too small is the single biggest choking risk. Use the size table below and move up a size if your dog can fit the toy in their mouth or tear pieces off easily.',
  },
  {
    title: 'Clean and store dry',
    body: 'Wash by hand after every few sessions and let the toy dry fully before the next use. Store in a dry, ventilated place and replace capsules every 4 to 6 weeks or as soon as the scent fades.',
  },
  {
    title: 'Quality checked',
    body: 'Every unit is checked for loose seams, sharp stitching and capsule integrity before it ships. If anything looks damaged when it arrives, contact us and we will replace it.',
  },
  {
    title: 'Know when to stop',
    body: 'Stop the session if your dog is panting heavily, frantic, or trying to swallow the toy. Let them rest and try again tomorrow with an easier puzzle.',
  },
]

const sizeGuide = [
  { weight: 'Under 8 kg', size: 'Small', note: 'Puppies and small breeds' },
  { weight: '8 to 20 kg', size: 'Medium', note: 'Most popular — beagles, cockers' },
  { weight: '20 to 35 kg', size: 'Large', note: 'Labradors, shepherds, collies' },
  { weight: 'Over 35 kg', size: 'Trail Kit', note: 'Built to be thrown and tugged' },
]

const values = [
  { title: 'Nose first', body: 'We design for the nose, because a dog’s most powerful sense is also the one we most often ignore.' },
  { title: 'No shortcuts', body: 'Food-grade materials, stitch-tested seams and sealed capsules. Nothing that would not be safe on our own dogs.' },
  { title: 'Made for real homes', body: 'Every product is tested with dogs of different ages and temperaments before it goes near a customer.' },
  { title: 'Straight answers', body: 'Clear sizing, honest delivery times and a support team that answers actual questions.' },
]

export function InfoPage({ kicker, title, intro, children }) {
  return (
    <section className="info-page">
      <div className="section-inner info-header">
        <span className="section-kicker">{kicker}</span>
        <h1>{title}</h1>
        {intro && <p className="info-intro">{intro}</p>}
      </div>
      <div className="section-inner info-body">{children}</div>
    </section>
  )
}

export function FaqPage() {
  return (
    <InfoPage
      kicker="Help centre"
      title="Frequently asked questions"
      intro="Everything people usually want to know before buying a scent toy for their dog. If your question is not here, we will happily answer it."
    >
      <div className="faq-list">
        {faqs.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <div className="info-cta">
        <h3>Still not sure?</h3>
        <p>Tell us your dog’s breed, age and weight and we will recommend the right kit.</p>
        <a className="btn btn-primary" href="#shop">Browse the kits</a>
      </div>
    </InfoPage>
  )
}

export function SafetyPage() {
  return (
    <InfoPage
      kicker="Safety first"
      title="Playing safe with scent toys"
      intro="A scent toy is only useful if it is safe. Here is exactly what we use, how to use it, and when to stop."
    >
      <div className="safety-grid">
        {safetyPoints.map((p) => (
          <div key={p.title} className="safety-card">
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h2>Size guide</h2>
        <p>
          Choose by your dog’s weight, not their age. If two sizes look right, pick the
          larger one — a toy that is too small is the main choking risk.
        </p>
        <table className="info-table">
          <thead>
            <tr><th>Dog weight</th><th>Recommended size</th><th>Good for</th></tr>
          </thead>
          <tbody>
            {sizeGuide.map((r) => (
              <tr key={r.weight}>
                <td>{r.weight}</td>
                <td>{r.size}</td>
                <td>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-section safety-warning">
        <h2>If something goes wrong</h2>
        <p>
          If your dog swallows a scent capsule or a piece of the toy, remove the toy
          immediately and contact your vet. Keep the order ID and the product name handy
          so we can tell you the exact materials involved. Do not induce vomiting unless
          your vet tells you to.
        </p>
      </div>
    </InfoPage>
  )
}

export function AboutPage({ products }) {
  return (
    <InfoPage
      kicker="Our story"
      title="We build for the nose"
      intro="ScentQuest started because our own dogs were exhausted after walks and still bored. We wanted something that tired them out the way a long hike does — without needing a hike."
    >
      <div className="info-section">
        <h2>Why scent work</h2>
        <p>
          Dogs were bred to track. That instinct is the reason they can find a scent
          through layers of soil and grass that we would never notice. Scent work gives
          that instinct a job, and it gives the dog a reward that keeps them thinking
          rather than just chewing.
        </p>
        <p>
          The difference shows after half an hour. A dog that has tracked down a hidden
          treat is a dog that lies down, chews less and settles faster. That was the
          whole idea, and everything we have built since is in service of it.
        </p>
      </div>

      <div className="info-section">
        <h2>What we make</h2>
        <div className="about-kits">
          {products.map((p) => (
            <a key={p.id} className="about-kit" href={`#product-${p.id}`}>
              <img src={p.images[0]} alt={p.name} />
              <div>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h2>How a kit gets made</h2>
        <ol className="about-steps">
          <li><strong>Prototype.</strong> Every kit starts as a rough shape we can test with a treat.</li>
          <li><strong>Dog test.</strong> We watch how dogs actually use it — where they lose interest, what they chew first.</li>
          <li><strong>Material check.</strong> Only food-grade, non-toxic materials make it into a production sample.</li>
          <li><strong>Stitch test.</strong> Seams are pulled, tugged and checked so nothing opens in a determined mouth.</li>
        </ol>
      </div>

      <div className="info-section">
        <h2>What we care about</h2>
        <div className="about-values">
          {values.map((v) => (
            <div key={v.title} className="about-value">
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h2>Talk to us</h2>
        <p>
          We are a small team and we answer our own messages. Ask us anything about
          sizing, scents or which kit suits your dog — mail us at
          <strong> hello@scentquest.example</strong> and include your order ID if the
          question is about an order.
        </p>
      </div>
    </InfoPage>
  )
}
