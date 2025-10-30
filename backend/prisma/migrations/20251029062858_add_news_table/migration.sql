-- CreateTable
CREATE TABLE "global_news" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_books" (
    "id" TEXT NOT NULL,
    "entry_number" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guest_name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "meet_with" TEXT,
    "purpose" TEXT NOT NULL,
    "signature_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_suggestions" (
    "id" TEXT NOT NULL,
    "suggestion_number" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "member_id" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "signature_url" TEXT,
    "response" TEXT,
    "response_by_user_id" TEXT,
    "response_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervisory_suggestions" (
    "id" TEXT NOT NULL,
    "suggestion_number" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supervisor_member_id" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "supervisor_signature_url" TEXT,
    "response" TEXT,
    "response_by_user_id" TEXT,
    "response_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisory_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "official_recommendations" (
    "id" TEXT NOT NULL,
    "entry_number" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "official_name" TEXT NOT NULL,
    "official_position_and_address" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "official_signature_url" TEXT,
    "response" TEXT,
    "response_by_user_id" TEXT,
    "response_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_news_slug_key" ON "global_news"("slug");

-- AddForeignKey
ALTER TABLE "member_suggestions" ADD CONSTRAINT "member_suggestions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_suggestions" ADD CONSTRAINT "member_suggestions_response_by_user_id_fkey" FOREIGN KEY ("response_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisory_suggestions" ADD CONSTRAINT "supervisory_suggestions_supervisor_member_id_fkey" FOREIGN KEY ("supervisor_member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisory_suggestions" ADD CONSTRAINT "supervisory_suggestions_response_by_user_id_fkey" FOREIGN KEY ("response_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "official_recommendations" ADD CONSTRAINT "official_recommendations_response_by_user_id_fkey" FOREIGN KEY ("response_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
