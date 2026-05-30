create table if not exists categories (
    id varchar(36) primary key,
    name varchar(100) not null unique,
    created_at datetime(6) not null,
    created_by varchar(40) not null
);

create table if not exists questions (
    id varchar(36) primary key,
    title varchar(255) not null,
    body text not null,
    category_id varchar(36) not null,
    uploader_name varchar(40) not null,
    uploaded_at datetime(6) not null,
    source_url varchar(500) null,
    answer text null,
    answer_author varchar(40) null,
    answered_at datetime(6) null,
    constraint fk_questions_category
        foreign key (category_id) references categories (id)
);

create table if not exists question_tags (
    question_id varchar(36) not null,
    tag_order int not null,
    tag_value varchar(50) not null,
    primary key (question_id, tag_order),
    constraint fk_question_tags_question
        foreign key (question_id) references questions (id)
        on delete cascade
);
