package com.dailyquestion.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QuestionTagMapper {

    @Select("""
            select tag_value
            from question_tags
            where question_id = #{questionId}
            order by tag_order asc
            """)
    List<String> findByQuestionId(String questionId);

    @Insert("""
            <script>
            insert into question_tags (question_id, tag_order, tag_value)
            values
            <foreach collection="tags" item="tag" index="index" separator=",">
                (#{questionId}, #{index}, #{tag})
            </foreach>
            </script>
            """)
    int batchInsert(@Param("questionId") String questionId, @Param("tags") List<String> tags);

    @Delete("""
            delete from question_tags
            where question_id = #{questionId}
            """)
    int deleteByQuestionId(String questionId);
}
