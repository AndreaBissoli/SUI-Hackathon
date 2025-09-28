PACKAGE="0xf5ae67db18c0929481348a24f32c52787107deb11ad549e73e3e4ff9921b5be0"
REGISTRY="0x861f29bdb779549231e6e177c26b519364246a8603c77ca8a1087f51928a1128"

# CREATE INVESTORS

sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function investor_create_profile \
  --args \
    "Andrea" \
    "Bissoli" \
    35 \
    "investor_img_url" \
    $REGISTRY \
    0x06 \
  --gas-budget 10000000

sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function investor_create_profile \
  --args \
    "Lorenzo" \
    "Moni" \
    35 \
    "investor_img_url" \
    $REGISTRY \
    0x06 \
  --gas-budget 10000000

sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function investor_create_profile \
  --args \
    "Alessandro" \
    "Bombarda" \
    35 \
    "investor_img_url" \
    $REGISTRY \
    0x06 \
  --gas-budget 10000000


# CREATE STUDENTS

sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function student_create_profile \
  --args \
    "Filippo" \
    "Viacala" \
    25 \
    "cv_url_123" \
    "profile_img_url" \
    100000 \
    20 \
    24 \
    $REGISTRY \
    0x06 \
  --gas-budget 10000000


sui client call \
    --package $PACKAGE \
    --module edu_defi \
    --function student_create_profile \
    --args \
    "Francesco" \
    "Pianola" \
    25 \
    "cv_url_123" \
    "profile_img_url" \
    100000 \
    20 \
    24 \
    $REGISTRY \
    0x06 \
    --gas-budget 10000000


sui client call \
  --package $PACKAGE \
  --module edu_defi \
  --function investor_propose_contract \
  --args \
    0x13f3d66ff9b6c227da7e13501114b3508b838939017516760678948384c79040 \
    "contract_pdf_hash" \
    100000000000 \
    30 \
    20 \
    24 \
    $REGISTRY \
    0x6 \
  --gas-budget 100000000