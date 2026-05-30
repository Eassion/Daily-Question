package com.dailyquestion.mapper;

import com.dailyquestion.domain.Question;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface QuestionMapper {

    @Select("""
            select
                q.id,
                q.title,
                q.body,
                q.category_id,
                c.name as category_name,
                q.uploader_name,
                q.uploaded_at,
                q.source_url,
                q.answer,
                q.answer_author,
                q.answered_at
            from questions q
            join categories c on c.id = q.category_id
            order by q.uploaded_at desc
            """)
    List<Question> findAll();

    @Select("""
            select
                q.id,
                q.title,
                q.body,
                q.category_id,
                c.name as category_name,
                q.uploader_name,
                q.uploaded_at,
                q.source_url,
                q.answer,
                q.answer_author,
                q.answered_at
            from questions q
            join categories c on c.id = q.category_id
            where q.id = #{id}
            limit 1
            """)
    Question findById(@Param("id") String id);

    @Insert("""
            insert into questions (
                id, title, body, category_id, uploader_name,
                uploaded_at, source_url, answer, answer_author, answered_at
            ) values (
                #{id}, #{title}, #{body}, #{categoryId}, #{uploaderName},
                #{uploadedAt}, #{sourceUrl}, #{answer}, #{answerAuthor}, #{answeredAt}
            )
            """)
    int insert(Question question);

    @Update("""
            update questions
            set title = #{title},
                body = #{body},
                category_id = #{categoryId},
                source_url = #{sourceUrl},
                answer = #{answer},
                answer_author = #{answerAuthor},
                answered_at = #{answeredAt}
            where id = #{id}
            """)
    int update(Question question);
}
